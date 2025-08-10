"""
Stripe webhook handler for xFood platform monetization
"""
from fastapi import APIRouter, Request, HTTPException, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.services.stripe_service import StripeService
from app.models.user import User
from app.models.subscription import Subscription
from app.models.purchase import Purchase
from app.models.recipe import Recipe
from app.models.bake import Bake
from app.core.config import settings
import stripe
import json

router = APIRouter()

@router.post("/stripe")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """Handle Stripe webhook events"""
    
    # Get the webhook payload
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    try:
        # Verify webhook signature
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Handle the event
    if event["type"] == "checkout.session.completed":
        await handle_checkout_session_completed(event, db)
    elif event["type"] == "invoice.payment_succeeded":
        await handle_invoice_payment_succeeded(event, db)
    elif event["type"] == "customer.subscription.updated":
        await handle_subscription_updated(event, db)
    elif event["type"] == "customer.subscription.deleted":
        await handle_subscription_deleted(event, db)
    elif event["type"] == "payment_intent.succeeded":
        await handle_payment_intent_succeeded(event, db)
    
    return {"status": "success"}

async def handle_checkout_session_completed(event: dict, db: Session):
    """Handle subscription checkout completion"""
    session = event["data"]["object"]
    
    if session.mode == "subscription":
        # Handle subscription creation
        subscription_id = session.subscription
        customer_id = session.customer
        
        # Get user by Stripe customer ID
        user = db.query(User).filter(User.stripe_customer_id == customer_id).first()
        if not user:
            return
        
        # Get subscription details from Stripe
        stripe_sub = StripeService.get_subscription(subscription_id)
        
        # Create or update subscription record
        subscription = db.query(Subscription).filter(
            Subscription.stripe_subscription_id == subscription_id
        ).first()
        
        if not subscription:
            subscription = Subscription(
                user_id=user.id,
                stripe_subscription_id=subscription_id,
                status=stripe_sub.status,
                current_period_start=stripe_sub.current_period_start,
                current_period_end=stripe_sub.current_period_end
            )
            db.add(subscription)
        else:
            subscription.status = stripe_sub.status
            subscription.current_period_start = stripe_sub.current_period_start
            subscription.current_period_end = stripe_sub.current_period_end
        
        # Update user subscription status
        if stripe_sub.status == "active":
            user.has_active_subscription = True
        
        db.commit()

async def handle_invoice_payment_succeeded(event: dict, db: Session):
    """Handle subscription renewal"""
    invoice = event["data"]["object"]
    
    if invoice.subscription:
        subscription_id = invoice.subscription
        subscription = db.query(Subscription).filter(
            Subscription.stripe_subscription_id == subscription_id
        ).first()
        
        if subscription:
            # Update subscription period
            stripe_sub = StripeService.get_subscription(subscription_id)
            subscription.current_period_start = stripe_sub.current_period_start
            subscription.current_period_end = stripe_sub.current_period_end
            subscription.status = stripe_sub.status
            
            # Ensure user has active subscription
            user = db.query(User).filter(User.id == subscription.user_id).first()
            if user and stripe_sub.status == "active":
                user.has_active_subscription = True
            
            db.commit()

async def handle_subscription_updated(event: dict, db: Session):
    """Handle subscription updates"""
    stripe_sub = event["data"]["object"]
    subscription = db.query(Subscription).filter(
        Subscription.stripe_subscription_id == stripe_sub.id
    ).first()
    
    if subscription:
        subscription.status = stripe_sub.status
        subscription.current_period_start = stripe_sub.current_period_start
        subscription.current_period_end = stripe_sub.current_period_end
        subscription.cancel_at_period_end = stripe_sub.cancel_at_period_end
        
        # Update user subscription status
        user = db.query(User).filter(User.id == subscription.user_id).first()
        if user:
            user.has_active_subscription = stripe_sub.status == "active"
        
        db.commit()

async def handle_subscription_deleted(event: dict, db: Session):
    """Handle subscription deletion"""
    stripe_sub = event["data"]["object"]
    subscription = db.query(Subscription).filter(
        Subscription.stripe_subscription_id == stripe_sub.id
    ).first()
    
    if subscription:
        subscription.status = "canceled"
        
        # Update user subscription status
        user = db.query(User).filter(User.id == subscription.user_id).first()
        if user:
            user.has_active_subscription = False
        
        db.commit()

async def handle_payment_intent_succeeded(event: dict, db: Session):
    """Handle successful item purchases"""
    payment_intent = event["data"]["object"]
    metadata = payment_intent.metadata
    
    # Check if this is an item purchase
    if metadata.get("platform") == "xfood" and metadata.get("item_type"):
        item_type = metadata["item_type"]
        item_id = int(metadata["item_id"])
        seller_id = int(metadata["seller_id"])
        buyer_id = int(metadata["buyer_id"])
        
        # Get buyer and seller
        buyer = db.query(User).filter(User.id == buyer_id).first()
        seller = db.query(User).filter(User.id == seller_id).first()
        
        if not buyer or not seller:
            return
        
        # Calculate platform fee and seller earnings
        amount_cents = payment_intent.amount
        platform_fee_cents = StripeService.calculate_platform_fee(amount_cents)
        seller_earnings_cents = amount_cents - platform_fee_cents
        
        # Create purchase record
        purchase = Purchase(
            buyer_id=buyer_id,
            seller_id=seller_id,
            item_type=item_type,
            item_id=item_id,
            amount_cents=amount_cents,
            platform_fee_cents=platform_fee_cents,
            seller_earnings_cents=seller_earnings_cents,
            stripe_payment_intent_id=payment_intent.id,
            status="completed"
        )
        
        db.add(purchase)
        db.commit()
