"""
Comment schemas for request/response validation
"""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


class CommentBase(BaseModel):
    """Base comment schema"""
    content: str = Field(..., min_length=1, max_length=1000)
    rating: Optional[float] = Field(5.0, ge=1, le=5)
    recipe_id: Optional[int] = None
    bake_id: Optional[int] = None
    parent_comment_id: Optional[int] = None


class CommentCreate(CommentBase):
    """Schema for creating a comment"""
    pass


class CommentUpdate(BaseModel):
    """Schema for updating a comment"""
    content: str = Field(..., min_length=1, max_length=1000)


class CommentInDB(CommentBase):
    """Schema for comment in database"""
    id: int
    user_id: int
    rating: Optional[float] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    # Computed field for frontend compatibility
    author_name: Optional[str] = None
    created_date: Optional[datetime] = None

    class Config:
        from_attributes = True


class Comment(CommentInDB):
    """Schema for comment response"""
    pass


class CommentList(BaseModel):
    """Schema for comment list response"""
    id: int
    content: str
    user_id: int
    recipe_id: Optional[int] = None
    bake_id: Optional[int] = None
    parent_comment_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


class CommentSearch(BaseModel):
    """Schema for comment search parameters"""
    recipe_id: Optional[int] = None
    bake_id: Optional[int] = None
    user_id: Optional[int] = None
    parent_comment_id: Optional[int] = None
    page: int = Field(1, ge=1)
    limit: int = Field(20, ge=1, le=100)
