"""
Message schemas for request/response validation
"""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


class MessageBase(BaseModel):
    """Base message schema"""
    content: str = Field(..., min_length=1)
    receiver_id: int
    bake_id: Optional[int] = None


class MessageCreate(MessageBase):
    """Schema for creating a message"""
    pass


class MessageUpdate(BaseModel):
    """Schema for updating a message"""
    content: Optional[str] = Field(None, min_length=1)
    image_url: Optional[str] = None


class MessageInDB(MessageBase):
    """Schema for message in database"""
    id: int
    sender_id: int
    image_url: Optional[str] = None
    is_read: bool = False
    created_at: datetime

    class Config:
        from_attributes = True


class Message(MessageInDB):
    """Schema for message response"""
    pass


class MessageList(BaseModel):
    """Schema for message list response"""
    id: int
    content: str
    sender_id: int
    receiver_id: int
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Conversation(BaseModel):
    """Schema for conversation response"""
    user_id: int
    user_name: str
    user_avatar: Optional[str] = None
    last_message: str
    last_message_time: datetime
    unread_count: int

    class Config:
        from_attributes = True


class MessageSearch(BaseModel):
    """Schema for message search parameters"""
    conversation_with: Optional[int] = None
    unread_only: bool = False
    page: int = Field(1, ge=1)
    limit: int = Field(20, ge=1, le=100)
