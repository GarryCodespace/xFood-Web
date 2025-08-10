"""
Recipe schemas for request/response validation
"""
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field


class RecipeBase(BaseModel):
    """Base recipe schema"""
    title: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=1)
    ingredients: List[str] = Field(..., min_items=1)
    instructions: List[str] = Field(..., min_items=1)
    prep_time: Optional[int] = Field(None, ge=0)  # in minutes
    cook_time: Optional[int] = Field(None, ge=0)  # in minutes
    servings: Optional[int] = Field(None, ge=1)
    difficulty: str = Field("medium", pattern="^(easy|medium|hard)$")
    category: str = Field(..., min_length=1, max_length=100)
    tags: Optional[List[str]] = []
    is_for_sale: bool = False
    price: Optional[float] = Field(None, ge=0)


class RecipeCreate(RecipeBase):
    """Schema for creating a recipe"""
    pass


class RecipeUpdate(BaseModel):
    """Schema for updating a recipe"""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, min_length=1)
    image_url: Optional[str] = None
    ingredients: Optional[List[str]] = Field(None, min_items=1)
    instructions: Optional[List[str]] = Field(None, min_items=1)
    prep_time: Optional[int] = Field(None, ge=0)
    cook_time: Optional[int] = Field(None, ge=0)
    servings: Optional[int] = Field(None, ge=1)
    difficulty: Optional[str] = Field(None, pattern="^(easy|medium|hard)$")
    category: Optional[str] = Field(None, min_length=1, max_length=100)
    tags: Optional[List[str]] = None
    is_for_sale: Optional[bool] = None
    price: Optional[float] = Field(None, ge=0)


class RecipeInDB(RecipeBase):
    """Schema for recipe in database"""
    id: int
    image_url: Optional[str] = None
    rating: float = 0.0
    review_count: int = 0
    created_by: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Recipe(RecipeInDB):
    """Schema for recipe response"""
    pass


class RecipeList(BaseModel):
    """Schema for recipe list response"""
    id: int
    title: str
    image_url: Optional[str] = None
    category: str
    difficulty: str
    rating: float
    review_count: int
    created_by: int
    created_at: datetime

    class Config:
        from_attributes = True


class RecipeSearch(BaseModel):
    """Schema for recipe search parameters"""
    query: Optional[str] = None
    category: Optional[str] = None
    difficulty: Optional[str] = None
    tags: Optional[List[str]] = None
    min_rating: Optional[float] = Field(None, ge=0, le=5)
    max_prep_time: Optional[int] = Field(None, ge=0)
    max_cook_time: Optional[int] = Field(None, ge=0)
    page: int = Field(1, ge=1)
    limit: int = Field(20, ge=1, le=100)
