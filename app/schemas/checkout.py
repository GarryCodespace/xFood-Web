"""
Checkout schemas for xFood platform monetization
"""
from pydantic import BaseModel
from typing import Optional

class CheckoutItemRequest(BaseModel):
    """Request schema for item checkout"""
    item_type: str  # 'recipe' or 'bake'
    item_id: int

class CheckoutSubscriptionRequest(BaseModel):
    """Request schema for subscription checkout"""
    pass  # No additional data needed for subscription

class CheckoutItemResponse(BaseModel):
    """Response schema for item checkout"""
    client_secret: str
    payment_intent_id: str
    amount_cents: int
    platform_fee_cents: int

class CheckoutSubscriptionResponse(BaseModel):
    """Response schema for subscription checkout"""
    checkout_url: str
    session_id: str

class CheckoutConfigResponse(BaseModel):
    """Response schema for checkout configuration"""
    publishable_key: str
    subscription_price_id: str
    platform_commission_percent: float
