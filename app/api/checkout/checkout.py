"""
Checkout API endpoints for xFood platform monetization
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any
from app.db.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.recipe import Recipe
from app.models.bake import Bake
from app.services.stripe_service import StripeService
from app.core.config import settings
from app.schemas.checkout import CheckoutItemRequest, CheckoutSubscriptionRequest

router = APIRouter()

@router.post("/item")
async def create_item_checkout(
    request: CheckoutItemRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a checkout session for purchasing an item"""
    
    # Get the item details
    if request.item_type == "recipe":
        item = db.query(Recipe).filter(Recipe.id == request.item_id).first()
        if not item:
            raise HTTPException(status_code=404, detail="Recipe not found")
        if not item.is_premium or not item.price_cents:
            raise HTTPException(status_code=400, detail="Item is not for sale")
        seller_id = item.created_by
        amount_cents = item.price_cents
    elif request.item_type == "bake":
        item = db.query(Bake).filter(Bake.id == request.item_id).first()
        if not item:
            raise HTTPException(status_code=404, detail="Bake not found")
        if not item.available_for_order:
            raise HTTPException(status_code=400, detail="Bake is not available for order")
        seller_id = item.created_by
        amount_cents = item.price_cents
    else:
        raise HTTPException(status_code=400, detail="Invalid item type")
    
    # Check if user is trying to buy their own item
    if seller_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot purchase your own item")
    
    # Get or create Stripe customer
    if not current_user.stripe_customer_id:
        stripe_customer = StripeService.create_customer(
            email=current_user.email,
            name=current_user.full_name
        )
        current_user.stripe_customer_id = stripe_customer.id
        db.commit()
    
    # Create payment intent
    metadata = {
        "item_type": request.item_type,
        "item_id": str(request.item_id),
        "seller_id": str(seller_id),
        "buyer_id": str(current_user.id),
        "platform": "xfood"
    }
    
    payment_intent = StripeService.create_payment_intent(
        amount_cents=amount_cents,
        customer_id=current_user.stripe_customer_id,
        metadata=metadata
    )
    
    return {
        "client_secret": payment_intent.client_secret,
        "payment_intent_id": payment_intent.id,
        "amount_cents": amount_cents,
        "platform_fee_cents": StripeService.calculate_platform_fee(amount_cents)
    }

@router.post("/subscription")
async def create_subscription_checkout(
    request: CheckoutSubscriptionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a checkout session for subscription"""
    
    # Get or create Stripe customer
    if not current_user.stripe_customer_id:
        stripe_customer = StripeService.create_customer(
            email=current_user.email,
            name=current_user.full_name
        )
        current_user.stripe_customer_id = stripe_customer.id
        db.commit()
    
    # Create checkout session
    checkout_session = StripeService.create_subscription_checkout_session(
        customer_id=current_user.stripe_customer_id,
        price_id=settings.STRIPE_SUBSCRIPTION_PRICE_ID,
        success_url=f"{settings.FRONTEND_URL}/subscription/success",
        cancel_url=f"{settings.FRONTEND_URL}/subscription/cancel"
    )
    
    return {
        "checkout_url": checkout_session.url,
        "session_id": checkout_session.id
    }

@router.get("/config")
async def get_checkout_config():
    """Get checkout configuration for frontend"""
    return {
        "publishable_key": settings.STRIPE_PUBLISHABLE_KEY,
        "subscription_price_id": settings.STRIPE_SUBSCRIPTION_PRICE_ID,
        "platform_commission_percent": settings.PLATFORM_COMMISSION_BPS / 100
    }
