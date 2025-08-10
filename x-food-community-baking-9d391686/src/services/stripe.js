import { loadStripe } from '@stripe/stripe-js';

// Load Stripe
let stripePromise;
const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const stripeService = {
  /**
   * Create checkout session for item purchase
   */
  async createItemCheckout(itemType, itemId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/checkout/item`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          item_type: itemType,
          item_id: itemId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating item checkout:', error);
      throw error;
    }
  },

  /**
   * Create checkout session for subscription
   */
  async createSubscriptionCheckout() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/checkout/subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        throw new Error('Failed to create subscription checkout');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating subscription checkout:', error);
      throw error;
    }
    },
    
    /**
     * Get checkout configuration
     */
    async getCheckoutConfig() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/checkout/config`);
        
        if (!response.ok) {
          throw new Error('Failed to get checkout config');
        }
        
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error getting checkout config:', error);
        throw error;
      }
    },

  /**
   * Redirect to Stripe checkout for subscription
   */
  async redirectToSubscriptionCheckout() {
    try {
      const checkoutData = await this.createSubscriptionCheckout();
      const stripe = await getStripe();
      
      if (stripe) {
        // For subscription, we redirect to the checkout URL
        window.location.href = checkoutData.checkout_url;
      }
    } catch (error) {
      console.error('Error redirecting to subscription checkout:', error);
      throw error;
    }
  },

  /**
   * Handle item purchase with Stripe Elements
   */
  async handleItemPurchase(itemType, itemId, onSuccess, onError) {
    try {
      const checkoutData = await this.createItemCheckout(itemType, itemId);
      const stripe = await getStripe();
      
      if (stripe) {
        // For item purchases, we'll use the client secret to confirm payment
        // This would typically be integrated with Stripe Elements in a form
        return checkoutData;
      }
    } catch (error) {
      console.error('Error handling item purchase:', error);
      onError?.(error);
      throw error;
    }
  }
};

export default stripeService;
