"""
Stripe service for xFood platform monetization
"""
import stripe
from typing import Dict, Any, Optional
from app.core.config import settings

# Initialize Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

# Platform commission (10%)
PLATFORM_COMMISSION_BPS = 1000  # 10% = 1000 basis points

class StripeService:
    """Service for handling Stripe operations"""
    
    @staticmethod
    def calculate_platform_fee(amount_cents: int) -> int:
        """Calculate platform commission fee"""
        return int((amount_cents * PLATFORM_COMMISSION_BPS) / 10000)
    
    @staticmethod
    def create_customer(email: str, name: str) -> stripe.Customer:
        """Create a Stripe customer"""
        return stripe.Customer.create(
            email=email,
            name=name,
            metadata={"platform": "xfood"}
        )
    
    @staticmethod
    def create_payment_intent(
        amount_cents: int,
        customer_id: str,
        metadata: Dict[str, Any]
    ) -> stripe.PaymentIntent:
        """Create a payment intent for item purchases"""
        return stripe.PaymentIntent.create(
            amount=amount_cents,
            currency="usd",
            customer=customer_id,
            metadata=metadata,
            automatic_payment_methods={"enabled": True}
        )
    
    @staticmethod
    def create_subscription_checkout_session(
        customer_id: str,
        price_id: str,
        success_url: str,
        cancel_url: str
    ) -> stripe.checkout.Session:
        """Create a checkout session for subscriptions"""
        return stripe.checkout.Session.create(
            customer=customer_id,
            payment_method_types=["card"],
            line_items=[{"price": price_id, "quantity": 1}],
            mode="subscription",
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={"platform": "xfood", "type": "subscription"}
        )
    
    @staticmethod
    def get_subscription(subscription_id: str) -> stripe.Subscription:
        """Get subscription details"""
        return stripe.Subscription.retrieve(subscription_id)
    
    @staticmethod
    def cancel_subscription(subscription_id: str) -> stripe.Subscription:
        """Cancel a subscription at period end"""
        return stripe.Subscription.modify(
            subscription_id,
            cancel_at_period_end=True
        )
    
    @staticmethod
    def get_payment_intent(payment_intent_id: str) -> stripe.PaymentIntent:
        """Get payment intent details"""
        return stripe.PaymentIntent.retrieve(payment_intent_id)
    
    @staticmethod
    def create_refund(payment_intent_id: str, amount_cents: Optional[int] = None) -> stripe.Refund:
        """Create a refund"""
        refund_data = {"payment_intent": payment_intent_id}
        if amount_cents:
            refund_data["amount"] = amount_cents
        return stripe.Refund.create(**refund_data)
