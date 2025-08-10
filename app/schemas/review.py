"""
Review schemas for request/response validation
"""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


class ReviewBase(BaseModel):
    """Base review schema"""
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = Field(None, min_length=1, max_length=1000)
    recipe_id: Optional[int] = None
    bake_id: Optional[int] = None


class ReviewCreate(ReviewBase):
    """Schema for creating a review"""
    pass


class ReviewUpdate(BaseModel):
    """Schema for updating a review"""
    rating: Optional[int] = Field(None, ge=1, le=5)
    comment: Optional[str] = Field(None, min_length=1, max_length=1000)


class ReviewInDB(ReviewBase):
    """Schema for review in database"""
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Review(ReviewInDB):
    """Schema for review response"""
    pass


class ReviewList(BaseModel):
    """Schema for review list response"""
    id: int
    rating: int
    comment: Optional[str] = None
    user_id: int
    recipe_id: Optional[int] = None
    bake_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ReviewSearch(BaseModel):
    """Schema for review search parameters"""
    recipe_id: Optional[int] = None
    bake_id: Optional[int] = None
    user_id: Optional[int] = None
    min_rating: Optional[int] = Field(None, ge=1, le=5)
    max_rating: Optional[int] = Field(None, ge=1, le=5)
    page: int = Field(1, ge=1)
    limit: int = Field(20, ge=1, le=100)
