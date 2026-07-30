from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime, timezone


class User(BaseModel):
    id: Optional[str] = None
    full_name: str
    email: EmailStr
    hashed_password: str
    role: str = "User"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))