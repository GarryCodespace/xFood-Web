"""
Bake model for products that are for sale
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Float, JSON, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.database import Base


class Bake(Base):
    """Bake model for products for sale"""
    __tablename__ = "bakes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=False)
    image_url = Column(String(500), nullable=True)
    category = Column(String(100), nullable=False)
    tags = Column(JSON, default=[])
    allergens = Column(JSON, default=[])
    price_cents = Column(Integer, nullable=False)  # Price in cents
    available_for_order = Column(Boolean, default=True)
    pickup_location = Column(String(255), nullable=True)
    full_address = Column(Text, nullable=True)
    phone_number = Column(String(20), nullable=True)
    circle_id = Column(Integer, ForeignKey("circles.id"), nullable=True)
    rating = Column(Float, default=0.0)
    review_count = Column(Integer, default=0)
    like_count = Column(Integer, default=0)
    comment_count = Column(Integer, default=0)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    creator = relationship("User", back_populates="bakes")
    circle = relationship("Circle", back_populates="bakes")
    # Removed problematic reviews relationship - reviews are accessed via item_type/item_id
    comments = relationship("Comment", back_populates="bake")
    likes = relationship("Like", back_populates="bake")

    @property
    def price(self):
        """Convert price_cents to dollars"""
        return self.price_cents / 100.0

    def __repr__(self):
        return f"<Bake(id={self.id}, title='{self.title}', price={self.price}, created_by={self.created_by})>"


