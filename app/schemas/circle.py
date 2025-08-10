"""
Circle schemas for request/response validation
"""
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field


class CircleBase(BaseModel):
    """Base circle schema"""
    name: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=1)
    location: Optional[str] = Field(None, max_length=255)
    tags: Optional[List[str]] = []
    is_public: bool = True


class CircleCreate(CircleBase):
    """Schema for creating a circle"""
    pass


class CircleUpdate(BaseModel):
    """Schema for updating a circle"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, min_length=1)
    image_url: Optional[str] = None
    location: Optional[str] = Field(None, max_length=255)
    tags: Optional[List[str]] = None
    is_public: Optional[bool] = None


class CircleInDB(CircleBase):
    """Schema for circle in database"""
    id: int
    image_url: Optional[str] = None
    member_count: int = 1
    created_by: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Circle(CircleInDB):
    """Schema for circle response"""
    pass


class CircleList(BaseModel):
    """Schema for circle list response"""
    id: int
    name: str
    image_url: Optional[str] = None
    location: Optional[str] = None
    member_count: int
    is_public: bool
    created_by: int
    created_at: datetime

    class Config:
        from_attributes = True


class CircleMemberBase(BaseModel):
    """Base circle member schema"""
    role: str = Field("member", pattern="^(member|moderator|admin)$")


class CircleMemberCreate(CircleMemberBase):
    """Schema for adding a member to a circle"""
    user_id: int


class CircleMemberUpdate(CircleMemberBase):
    """Schema for updating circle member role"""
    pass


class CircleMember(CircleMemberBase):
    """Schema for circle member response"""
    id: int
    circle_id: int
    user_id: int
    joined_at: datetime

    class Config:
        from_attributes = True


class CircleSearch(BaseModel):
    """Schema for circle search parameters"""
    query: Optional[str] = None
    tags: Optional[List[str]] = None
    location: Optional[str] = None
    is_public: Optional[bool] = None
    min_members: Optional[int] = Field(None, ge=1)
    page: int = Field(1, ge=1)
    limit: int = Field(20, ge=1, le=100)
