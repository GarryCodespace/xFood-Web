import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2, Crown, CheckCircle, XCircle, Star } from 'lucide-react';
import { stripeService } from '../../services/stripe';

const SubscriptionCheckout = ({ onSuccess, onError, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [config, setConfig] = useState(null);

  useEffect(() => {
    loadCheckoutConfig();
  }, []);

  const loadCheckoutConfig = async () => {
    try {
      const checkoutConfig = await stripeService.getCheckoutConfig();
      setConfig(checkoutConfig);
    } catch (err) {
      setError('Failed to load checkout configuration');
    }
  };

  const handleSubscribe = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await stripeService.redirectToSubscriptionCheckout();
      // The redirect will happen automatically
    } catch (err) {
      setError(err.message || 'Failed to start subscription process');
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onCancel?.();
  };

  if (!config) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading subscription options...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
          <Crown className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl">Premium Subscription</CardTitle>
        <CardDescription>
          Unlock unlimited access to premium content and features
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Features List */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center gap-3">
            <Star className="w-5 h-5 text-yellow-500 fill-current" />
            <span>Unlimited premium recipe access</span>
          </div>
          <div className="flex items-center gap-3">
            <Star className="w-5 h-5 text-yellow-500 fill-current" />
            <span>Exclusive baking circles</span>
          </div>
          <div className="flex items-center gap-3">
            <Star className="w-5 h-5 text-yellow-500 fill-current" />
            <span>Priority customer support</span>
          </div>
          <div className="flex items-center gap-3">
            <Star className="w-5 h-5 text-yellow-500 fill-current" />
            <span>Early access to new features</span>
          </div>
          <div className="flex items-center gap-3">
            <Star className="w-5 h-5 text-yellow-500 fill-current" />
            <span>Ad-free experience</span>
          </div>
        </div>

        {/* Pricing */}
        <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">$9.99</div>
            <div className="text-gray-600">per month</div>
            <div className="text-sm text-gray-500 mt-1">
              Cancel anytime • No commitment
            </div>
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
            onClick={handleSubscribe}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Subscribe Now'
            )}
          </Button>
        </div>

        {/* Security Notice */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            🔒 Secure payment powered by Stripe
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionCheckout;
