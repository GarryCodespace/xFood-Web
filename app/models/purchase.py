"""
Purchase model for xFood platform monetization
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.database import Base


class Purchase(Base):
    """Purchase model for tracking transactions"""
    __tablename__ = "purchases"
    
    id = Column(Integer, primary_key=True, index=True)
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    seller_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    item_type = Column(String(50), nullable=False)  # 'recipe', 'bake'
    item_id = Column(Integer, nullable=False, index=True)
    amount_cents = Column(Integer, nullable=False)  # Amount in cents
    platform_fee_cents = Column(Integer, nullable=False)  # Platform commission (10%)
    seller_earnings_cents = Column(Integer, nullable=False)  # Amount - platform fee
    stripe_payment_intent_id = Column(String(255), unique=True, nullable=False, index=True)
    status = Column(String(50), default="completed")  # completed, pending, failed, refunded
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    buyer = relationship("User", foreign_keys=[buyer_id], back_populates="purchases_made")
    seller = relationship("User", foreign_keys=[seller_id], back_populates="purchases_received")
    
    def __repr__(self):
        return f"<Purchase(id={self.id}, buyer_id={self.buyer_id}, item_type='{self.item_type}', amount_cents={self.amount_cents})>"
