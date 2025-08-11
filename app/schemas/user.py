"""
User schemas for request/response validation
"""
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    """Base user schema"""
    email: EmailStr
    full_name: str = Field(..., min_length=1, max_length=255)
    location: Optional[str] = Field(None, max_length=255)
    bio: Optional[str] = None
    dietary_preferences: Optional[List[str]] = []


class UserCreate(UserBase):
    """Schema for creating a user"""
    password: str = Field(..., min_length=8, max_length=100)


class UserUpdate(BaseModel):
    """Schema for updating a user"""
    full_name: Optional[str] = Field(None, min_length=1, max_length=255)
    location: Optional[str] = Field(None, max_length=255)
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    dietary_preferences: Optional[List[str]] = None


class UserInDB(UserBase):
    """Schema for user in database"""
    id: int
    avatar_url: Optional[str] = None
    rating: float = 0.0
    review_count: int = 0
    is_verified: bool = False
    is_active: bool = True
    role: str = "user"
    join_date: datetime
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class User(UserInDB):
    """Schema for user response"""
    pass


class UserLogin(BaseModel):
    """Schema for user login"""
    email: EmailStr
    password: str


class Token(BaseModel):
    """Schema for authentication token"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Schema for token data"""
    email: Optional[str] = None


class GoogleAuthRequest(BaseModel):
    """Schema for Google OAuth authentication request"""
    id_token: str = Field(..., description="Google ID token from frontend")


class UserProfile(BaseModel):
    """Schema for user profile display"""
    id: int
    full_name: str
    avatar_url: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    rating: float
    review_count: int
    is_verified: bool
    join_date: datetime
    role: str

    class Config:
        from_attributes = True
