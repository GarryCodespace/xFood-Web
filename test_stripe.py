#!/usr/bin/env python3
"""
Test script for Stripe implementation
"""
import os
import sys
from pathlib import Path

# Add the app directory to the Python path
sys.path.insert(0, str(Path(__file__).parent / "app"))

def test_stripe_imports():
    """Test if all Stripe-related modules can be imported"""
    try:
        print("Testing Stripe imports...")
        
        # Test Stripe service
        from app.services.stripe_service import StripeService
        print("✅ StripeService imported successfully")
        
        # Test checkout API
        from app.api.checkout.checkout import router as checkout_router
        print("✅ Checkout router imported successfully")
        
        # Test webhooks
        from app.api.webhooks.stripe import router as webhook_router
        print("✅ Webhook router imported successfully")
        
        # Test models
        from app.models.purchase import Purchase
        from app.models.subscription import Subscription
        print("✅ Purchase and Subscription models imported successfully")
        
        # Test schemas
        from app.schemas.checkout import CheckoutItemRequest, CheckoutSubscriptionRequest
        print("✅ Checkout schemas imported successfully")
        
        print("\n🎉 All Stripe-related imports successful!")
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def test_stripe_service_methods():
    """Test Stripe service methods"""
    try:
        print("\nTesting Stripe service methods...")
        
        from app.services.stripe_service import StripeService
        
        # Test platform fee calculation
        fee = StripeService.calculate_platform_fee(1000)  # $10.00
        assert fee == 100, f"Expected 100, got {fee}"
        print("✅ Platform fee calculation works")
        
        print("🎉 Stripe service methods test successful!")
        return True
        
    except Exception as e:
        print(f"❌ Stripe service test failed: {e}")
        return False

def test_config():
    """Test configuration loading"""
    try:
        print("\nTesting configuration...")
        
        from app.core.config import settings
        
        print(f"✅ App name: {settings.APP_NAME}")
        print(f"✅ API prefix: {settings.API_PREFIX}")
        print(f"✅ Platform commission: {settings.PLATFORM_COMMISSION_BPS / 100}%")
        
        # Check if Stripe keys are configured (they might be None in development)
        print(f"✅ Stripe secret key configured: {'Yes' if settings.STRIPE_SECRET_KEY else 'No (will use test mode)'}")
        print(f"✅ Stripe publishable key configured: {'Yes' if settings.STRIPE_PUBLISHABLE_KEY else 'No (will use test mode)'}")
        
        print("🎉 Configuration test successful!")
        return True
        
    except Exception as e:
        print(f"❌ Configuration test failed: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Testing Stripe implementation...\n")
    
    success = True
    success &= test_stripe_imports()
    success &= test_stripe_service_methods()
    success &= test_config()
    
    if success:
        print("\n🎉 All tests passed! Stripe implementation is ready.")
    else:
        print("\n❌ Some tests failed. Please check the errors above.")
        sys.exit(1)
