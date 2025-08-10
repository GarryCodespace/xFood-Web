# Stripe Payment Integration for xFood Platform

This document outlines the complete Stripe payment integration implemented for the xFood Community Baking Platform.

## 🏗️ Architecture Overview

The Stripe integration consists of:

### Backend (FastAPI)
- **Payment Processing**: Secure payment intents and checkout sessions
- **Webhook Handling**: Real-time payment status updates
- **Subscription Management**: Premium subscription handling
- **Platform Fees**: Automatic 10% commission calculation

### Frontend (React)
- **Payment Forms**: Secure card input with Stripe Elements
- **Subscription Checkout**: Premium subscription management
- **Payment Modals**: Reusable payment components

## 🔧 Backend Implementation

### 1. Stripe Service (`app/services/stripe_service.py`)
```python
class StripeService:
    # Customer management
    create_customer(email, name)
    
    # Payment processing
    create_payment_intent(amount_cents, customer_id, metadata)
    create_subscription_checkout_session(customer_id, price_id, success_url, cancel_url)
    
    # Platform fee calculation
    calculate_platform_fee(amount_cents)  # 10% commission
```

### 2. Checkout API (`app/api/checkout/checkout.py`)
- **POST** `/api/v1/checkout/item` - Create item purchase payment intent
- **POST** `/api/v1/checkout/subscription` - Create subscription checkout session
- **GET** `/api/v1/checkout/config` - Get checkout configuration

### 3. Webhook Handler (`app/api/webhooks/stripe.py`)
Handles real-time events:
- `checkout.session.completed` - Subscription creation
- `invoice.payment_succeeded` - Subscription renewal
- `payment_intent.succeeded` - Item purchase completion
- `customer.subscription.updated` - Subscription status changes

### 4. Database Models
- **Purchase**: Tracks item transactions with platform fees
- **Subscription**: Manages premium subscriptions
- **User**: Enhanced with Stripe customer ID and subscription status

## 🎨 Frontend Implementation

### 1. Payment Components
- **StripePaymentForm**: Secure card input for item purchases
- **SubscriptionCheckout**: Premium subscription management
- **PaymentModal**: Unified payment interface

### 2. Stripe Service (`src/services/stripe.js`)
```javascript
const stripeService = {
  createItemCheckout(itemType, itemId),
  createSubscriptionCheckout(),
  redirectToSubscriptionCheckout(),
  getCheckoutConfig()
};
```

### 3. Demo Page (`src/pages/PaymentDemo.jsx`)
Interactive demonstration of:
- Item purchases (recipes, bakes)
- Premium subscriptions
- Payment flow testing

## 🚀 Getting Started

### 1. Backend Setup

#### Environment Variables
Create `.env` file in the backend root:
```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_SUBSCRIPTION_PRICE_ID=price_your_subscription_price_id

# Other required settings
DATABASE_URL=your_database_url
SECRET_KEY=your_jwt_secret
```

#### Install Dependencies
```bash
pip install -r requirements.txt
```

#### Database Migration
```bash
# The models are already included in the migration files
python -m app.main
```

### 2. Frontend Setup

#### Environment Variables
Create `.env.local` file in the frontend root:
```bash
VITE_API_BASE_URL=http://localhost:8000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

#### Install Dependencies
```bash
npm install
```

#### Start Development Server
```bash
npm run dev
```

### 3. Stripe Dashboard Setup

#### Create Products & Prices
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Create a subscription product with recurring pricing
3. Note the `price_id` for the subscription

#### Configure Webhooks
1. Go to Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/v1/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `payment_intent.succeeded`
4. Copy the webhook secret to your `.env` file

## 💳 Payment Flow

### Item Purchase Flow
1. User selects premium item (recipe/bake)
2. Frontend calls `/api/v1/checkout/item`
3. Backend creates Stripe payment intent
4. Frontend displays Stripe Elements form
5. User enters card details and submits
6. Stripe processes payment
7. Webhook confirms success and updates database
8. User gains access to purchased content

### Subscription Flow
1. User clicks subscribe button
2. Frontend calls `/api/v1/checkout/subscription`
3. Backend creates Stripe checkout session
4. User redirected to Stripe hosted checkout
5. User completes payment
6. Webhook creates subscription record
7. User gains premium access

## 🔒 Security Features

- **Webhook Signature Verification**: Ensures webhook authenticity
- **Platform Fee Calculation**: Server-side fee computation
- **Customer Isolation**: Users can't purchase their own items
- **Metadata Validation**: Comprehensive transaction tracking
- **HTTPS Enforcement**: Secure communication channels

## 📊 Platform Economics

- **Platform Commission**: 10% on all transactions
- **Automatic Fee Calculation**: Server-side processing
- **Seller Earnings**: Automatic calculation and tracking
- **Transaction Records**: Complete audit trail

## 🧪 Testing

### Backend Testing
```bash
python test_stripe.py
```

### Frontend Testing
1. Navigate to `/PaymentDemo`
2. Test item purchases with Stripe test cards
3. Test subscription flow
4. Verify webhook handling

### Test Card Numbers
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

## 🚨 Common Issues & Solutions

### 1. Webhook Failures
- Verify webhook secret in environment
- Check webhook endpoint URL accessibility
- Ensure proper event selection in Stripe dashboard

### 2. Payment Intent Creation Fails
- Verify Stripe secret key
- Check customer creation
- Validate item existence and pricing

### 3. Frontend Payment Form Issues
- Verify publishable key
- Check Stripe Elements loading
- Ensure proper CORS configuration

## 🔄 Webhook Events

| Event | Description | Action |
|-------|-------------|---------|
| `checkout.session.completed` | Subscription checkout completed | Create subscription record |
| `invoice.payment_succeeded` | Subscription payment successful | Update subscription period |
| `payment_intent.succeeded` | Item purchase completed | Create purchase record |
| `customer.subscription.updated` | Subscription modified | Update subscription status |
| `customer.subscription.deleted` | Subscription cancelled | Mark subscription inactive |

## 📈 Monitoring & Analytics

### Stripe Dashboard
- Transaction volume and revenue
- Customer acquisition metrics
- Subscription churn analysis
- Payment failure rates

### Application Metrics
- Purchase conversion rates
- Subscription retention
- Platform fee revenue
- User engagement with premium content

## 🚀 Production Deployment

### Environment Variables
```bash
# Production Stripe keys
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Production URLs
FRONTEND_URL=https://yourdomain.com
CORS_ORIGINS=["https://yourdomain.com"]
```

### Security Checklist
- [ ] Use production Stripe keys
- [ ] Enable webhook signature verification
- [ ] Configure HTTPS endpoints
- [ ] Set up proper CORS policies
- [ ] Enable rate limiting
- [ ] Monitor webhook delivery

## 🤝 Support & Maintenance

### Regular Tasks
- Monitor webhook delivery rates
- Review failed payment reports
- Update Stripe SDK versions
- Audit transaction records
- Monitor subscription metrics

### Troubleshooting
- Check Stripe dashboard for errors
- Review application logs
- Verify webhook endpoint accessibility
- Test with Stripe CLI locally

## 📚 Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe React Components](https://stripe.com/docs/stripe-js/react)
- [Webhook Best Practices](https://stripe.com/docs/webhooks/best-practices)
- [Testing Guide](https://stripe.com/docs/testing)

---

**Note**: This integration is designed for development and testing. For production use, ensure proper security measures, monitoring, and compliance with financial regulations.
