"""
Like schemas for request/response validation
"""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


class LikeBase(BaseModel):
    """Base like schema"""
    recipe_id: Optional[int] = None
    bake_id: Optional[int] = None


class LikeCreate(LikeBase):
    """Schema for creating a like"""
    pass


class LikeInDB(LikeBase):
    """Schema for like in database"""
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class Like(LikeInDB):
    """Schema for like response"""
    pass


class LikeList(BaseModel):
    """Schema for like list response"""
    id: int
    user_id: int
    recipe_id: Optional[int] = None
    bake_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


class LikeSearch(BaseModel):
    """Schema for like search parameters"""
    recipe_id: Optional[int] = None
    bake_id: Optional[int] = None
    user_id: Optional[int] = None
    page: int = Field(1, ge=1)
    limit: int = Field(20, ge=1, le=100)
