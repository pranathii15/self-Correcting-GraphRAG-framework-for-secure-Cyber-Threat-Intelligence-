from fastapi import APIRouter, HTTPException

from app.schemas.user import (
    UserCreate,
    UserLogin,
    UserResponse,
    Token,
)

from app.services.user_service import (
    register_user,
    login_user,
)

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post(
    "/register",
    response_model=UserResponse
)
def register(user: UserCreate):

    new_user = register_user(user)

    if not new_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered."
        )
    return new_user

    # return {
    #     "id": new_user["id"],
    #     "full_name": new_user["full_name"],
    #     "email": new_user["email"],
    #     "role": new_user["role"],
    #     "created_at": new_user["created_at"]

    # }


@router.post(
    "/login",
    response_model=Token
)
def login(user: UserLogin):

    token = login_user(user)

    if not token:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    return token