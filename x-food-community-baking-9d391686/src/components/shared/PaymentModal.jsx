import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import StripePaymentForm from './StripePaymentForm';
import SubscriptionCheckout from './SubscriptionCheckout';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  mode = 'item', // 'item' or 'subscription'
  itemData = null, // { type, id, title, priceCents }
  onSuccess,
  onError 
}) => {
  const [activeTab, setActiveTab] = useState(mode === 'subscription' ? 'subscription' : 'item');

  const handleSuccess = (result) => {
    onSuccess?.(result);
    onClose();
  };

  const handleError = (error) => {
    onError?.(error);
  };

  const handleCancel = () => {
    onClose();
  };

  const renderContent = () => {
    if (mode === 'subscription') {
      return (
        <SubscriptionCheckout
          onSuccess={handleSuccess}
          onError={handleError}
          onCancel={handleCancel}
        />
      );
    }

    if (mode === 'item' && itemData) {
      return (
        <Elements stripe={stripePromise}>
          <StripePaymentForm
            itemType={itemData.type}
            itemId={itemData.id}
            itemTitle={itemData.title}
            amountCents={itemData.priceCents}
            onSuccess={handleSuccess}
            onError={handleError}
            onCancel={handleCancel}
          />
        </Elements>
      );
    }

    // Mixed mode - show both options
    return (
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="item">Purchase Item</TabsTrigger>
          <TabsTrigger value="subscription">Subscribe</TabsTrigger>
        </TabsList>
        
        <TabsContent value="item" className="mt-6">
          {itemData ? (
            <Elements stripe={stripePromise}>
              <StripePaymentForm
                itemType={itemData.type}
                itemId={itemData.id}
                itemTitle={itemData.title}
                amountCents={itemData.priceCents}
                onSuccess={handleSuccess}
                onError={handleError}
                onCancel={handleCancel}
              />
            </Elements>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No item selected for purchase
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="subscription" className="mt-6">
          <SubscriptionCheckout
            onSuccess={handleSuccess}
            onError={handleError}
            onCancel={handleCancel}
          />
        </TabsContent>
      </Tabs>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'subscription' ? 'Premium Subscription' : 'Complete Purchase'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'subscription' 
              ? 'Unlock premium features with a subscription'
              : 'Complete your purchase securely'
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
