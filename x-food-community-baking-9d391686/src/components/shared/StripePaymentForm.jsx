import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2, CreditCard, CheckCircle, XCircle } from 'lucide-react';
import { stripeService } from '../../services/stripe';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#9e2146',
    },
  },
};

const StripePaymentForm = ({ 
  itemType, 
  itemId, 
  itemTitle, 
  amountCents, 
  onSuccess, 
  onError, 
  onCancel 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentIntentId, setPaymentIntentId] = useState(null);

  const amount = (amountCents / 100).toFixed(2);
  const platformFee = (amountCents * 0.1 / 100).toFixed(2); // 10% platform fee
  const total = (parseFloat(amount) + parseFloat(platformFee)).toFixed(2);

  useEffect(() => {
    // Create payment intent when component mounts
    createPaymentIntent();
  }, []);

  const createPaymentIntent = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const checkoutData = await stripeService.createItemCheckout(itemType, itemId);
      setClientSecret(checkoutData.client_secret);
      setPaymentIntentId(checkoutData.payment_intent_id);
    } catch (err) {
      setError(err.message || 'Failed to create payment intent');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            // You can add billing details here if needed
          },
        },
      });

      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
      } else if (paymentIntent.status === 'succeeded') {
        setSuccess(true);
        onSuccess?.(paymentIntent);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onCancel?.();
  };

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Payment Successful!</h3>
          <p className="text-gray-600 mb-4">
            You have successfully purchased "{itemTitle}"
          </p>
          <Button onClick={() => window.location.reload()} className="w-full">
            Continue
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Complete Purchase
        </CardTitle>
        <CardDescription>
          Purchase "{itemTitle}" securely with your card
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Price Breakdown */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Item Price:</span>
            <span className="font-medium">${amount}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Platform Fee (10%):</span>
            <span className="font-medium">${platformFee}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t">
            <span className="font-semibold">Total:</span>
            <span className="font-bold text-lg">${total}</span>
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card Details
            </label>
            <div className="border rounded-md p-3">
              <CardElement options={CARD_ELEMENT_OPTIONS} />
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!stripe || loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay $${total}`
              )}
            </Button>
          </div>
        </form>

        {/* Security Notice */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            🔒 Your payment information is secure and encrypted
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StripePaymentForm;
