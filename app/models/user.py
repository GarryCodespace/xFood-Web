"""
User model for the xFood platform
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Float, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.database import Base


class User(Base):
    """User model"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    avatar_url = Column(String(500), nullable=True)
    location = Column(String(255), nullable=True)
    bio = Column(Text, nullable=True)
    rating = Column(Float, default=0.0)
    review_count = Column(Integer, default=0)
    is_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    role = Column(String(50), default="user")  # user, baker, admin
    dietary_preferences = Column(JSON, default=[])  # Changed from ARRAY to JSON for SQLite compatibility
    join_date = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Monetization fields
    stripe_customer_id = Column(String(255), nullable=True, index=True)
    has_active_subscription = Column(Boolean, default=False)
    first_post_used = Column(Boolean, default=False)  # Track if free post was used
    
    # Relationships - simplified to avoid circular dependencies
    recipes = relationship("Recipe", back_populates="creator")
    bakes = relationship("Bake", back_populates="creator")
    circles = relationship("Circle", back_populates="creator")
    # Removed problematic relationships that might cause circular dependency issues
    comments = relationship("Comment", back_populates="user")
    likes = relationship("Like", back_populates="user")
    sent_messages = relationship("Message", foreign_keys="Message.sender_id", back_populates="sender")
    received_messages = relationship("Message", foreign_keys="Message.receiver_id", back_populates="receiver")
    
    # Monetization relationships
    subscriptions = relationship("Subscription", back_populates="user")
    purchases_made = relationship("Purchase", foreign_keys="Purchase.buyer_id", back_populates="buyer")
    purchases_received = relationship("Purchase", foreign_keys="Purchase.seller_id", back_populates="seller")
    
    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}', full_name='{self.full_name}')>"


