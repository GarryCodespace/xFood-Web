"""
Circle model for baking communities
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, JSON, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.database import Base


class Circle(Base):
    """Circle model for baking communities"""
    __tablename__ = "circles"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=False)
    image_url = Column(String(500), nullable=True)
    location = Column(String(255), nullable=True)
    tags = Column(JSON, default=[])  # Changed from ARRAY to JSON for SQLite compatibility
    is_public = Column(Boolean, default=True)
    member_count = Column(Integer, default=1)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    creator = relationship("User", back_populates="circles")
    bakes = relationship("Bake", back_populates="circle")
    members = relationship("CircleMember", back_populates="circle")
    
    def __repr__(self):
        return f"<Circle(id={self.id}, name='{self.name}', member_count={self.member_count})>"


class CircleMember(Base):
    """Circle membership model"""
    __tablename__ = "circle_members"
    
    id = Column(Integer, primary_key=True, index=True)
    circle_id = Column(Integer, ForeignKey("circles.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(String(50), default="member")  # member, moderator, admin
    joined_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    circle = relationship("Circle", back_populates="members")
    user = relationship("User")
    
    def __repr__(self):
        return f"<CircleMember(circle_id={self.circle_id}, user_id={self.user_id}, role='{self.role}')>"


