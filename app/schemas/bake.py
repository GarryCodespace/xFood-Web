"""
Bake schemas for request/response validation
"""
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field


class BakeBase(BaseModel):
    """Base bake schema"""
    title: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=1)
    category: str = Field(..., min_length=1, max_length=100)
    tags: Optional[List[str]] = []
    allergens: Optional[List[str]] = []
    price: float = Field(..., gt=0)
    pickup_location: Optional[str] = Field(None, max_length=255)
    full_address: Optional[str] = None
    phone_number: Optional[str] = Field(None, max_length=20)
    circle_id: Optional[int] = None


class BakeCreate(BakeBase):
    """Schema for creating a bake"""
    pass


class BakeUpdate(BaseModel):
    """Schema for updating a bake"""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, min_length=1)
    image_url: Optional[str] = None
    category: Optional[str] = Field(None, min_length=1, max_length=100)
    tags: Optional[List[str]] = None
    allergens: Optional[List[str]] = None
    price: Optional[float] = Field(None, gt=0)
    available_for_order: Optional[bool] = None
    pickup_location: Optional[str] = Field(None, max_length=255)
    full_address: Optional[str] = None
    phone_number: Optional[str] = Field(None, max_length=20)
    circle_id: Optional[int] = None


class BakeInDB(BakeBase):
    """Schema for bake in database"""
    id: int
    image_url: Optional[str] = None
    available_for_order: bool = True
    rating: float = 0.0
    review_count: int = 0
    created_by: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Bake(BakeInDB):
    """Schema for bake response"""
    pass


class BakeList(BaseModel):
    """Schema for bake list response"""
    id: int
    title: str
    image_url: Optional[str] = None
    category: str
    price: float
    rating: float
    review_count: int
    available_for_order: bool
    created_by: int
    created_at: datetime

    class Config:
        from_attributes = True


class BakeSearch(BaseModel):
    """Schema for bake search parameters"""
    query: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    allergens: Optional[List[str]] = None
    min_price: Optional[float] = Field(None, ge=0)
    max_price: Optional[float] = Field(None, ge=0)
    min_rating: Optional[float] = Field(None, ge=0, le=5)
    available_only: bool = True
    location: Optional[str] = None
    radius: Optional[float] = Field(None, ge=0)  # in kilometers
    page: int = Field(1, ge=1)
    limit: int = Field(20, ge=1, le=100)
