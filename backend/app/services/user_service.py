from bson import ObjectId
from datetime import datetime, timezone
from app.database import db
from app.core.security import hash_password, verify_password
from app.core.jwt_handler import create_access_token

users_collection = db["users"]


def register_user(user):
    # Check if email already exists
    existing_user = users_collection.find_one(
        {"email": user.email}
    )

    if existing_user:
        return None

    new_user = {
        "full_name": user.full_name,
        "email": user.email,
        "hashed_password": hash_password(user.password),
        "role": "User",
        "created_at": datetime.now(timezone.utc)
    }

    result = users_collection.insert_one(new_user)

    new_user["id"] = str(result.inserted_id)

    return new_user


def login_user(user):
    existing_user = users_collection.find_one(
        {"email": user.email}
    )

    if not existing_user:
        return None

    if not verify_password(
        user.password,
        existing_user["hashed_password"]
    ):
        return None

    token = create_access_token(
        {
            "sub": existing_user["email"]
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }


def get_user_by_email(email: str):
    user = users_collection.find_one(
        {"email": email}
    )

    if user:
        user["id"] = str(user["_id"])

    return user


def get_user_by_id(user_id: str):
    user = users_collection.find_one(
        {"_id": ObjectId(user_id)}
    )

    if user:
        user["id"] = str(user["_id"])

    return user