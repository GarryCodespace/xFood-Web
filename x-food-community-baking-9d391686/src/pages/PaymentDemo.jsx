import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import PaymentModal from '../components/shared/PaymentModal';
import { CreditCard, Crown, ShoppingCart, Star, CheckCircle, Shield } from 'lucide-react';

const PaymentDemo = () => {
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('item');
  const [selectedItem, setSelectedItem] = useState(null);

  const demoItems = [
    {
      id: 1,
      type: 'recipe',
      title: 'Secret Family Chocolate Cake',
      description: 'A decadent chocolate cake recipe passed down through generations',
      priceCents: 999, // $9.99
      category: 'Dessert',
      difficulty: 'Medium',
      rating: 4.8,
      reviewCount: 127
    },
    {
      id: 2,
      type: 'bake',
      title: 'Artisan Sourdough Bread',
      description: 'Freshly baked sourdough bread with crispy crust and soft interior',
      priceCents: 1299, // $12.99
      category: 'Bread',
      difficulty: 'Hard',
      rating: 4.9,
      reviewCount: 89
    },
    {
      id: 3,
      type: 'recipe',
      title: 'Professional Pastry Techniques',
      description: 'Advanced techniques for creating restaurant-quality pastries',
      priceCents: 1999, // $19.99
      category: 'Pastry',
      difficulty: 'Expert',
      rating: 4.7,
      reviewCount: 203
    }
  ];

  const handlePurchaseItem = (item) => {
    setSelectedItem(item);
    setModalMode('item');
    setPaymentModalOpen(true);
  };

  const handleSubscribe = () => {
    setSelectedItem(null);
    setModalMode('subscription');
    setPaymentModalOpen(true);
  };

  const handlePaymentSuccess = (result) => {
    console.log('Payment successful:', result);
    // You can add success notifications here
  };

  const handlePaymentError = (error) => {
    console.error('Payment failed:', error);
    // You can add error notifications here
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Stripe Payment Demo
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience secure payments with Stripe integration. Test item purchases and premium subscriptions.
          </p>
        </div>

        {/* Subscription Section */}
        <Card className="mb-12">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <Crown className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-3xl">Premium Subscription</CardTitle>
            <CardDescription className="text-lg">
              Unlock unlimited access to premium content and features
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="mb-6">
              <div className="text-4xl font-bold text-gray-900 mb-2">$9.99</div>
              <div className="text-gray-600">per month</div>
            </div>
            <Button 
              onClick={handleSubscribe}
              size="lg"
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
            >
              <Crown className="w-5 h-5 mr-2" />
              Subscribe Now
            </Button>
          </CardContent>
        </Card>

        {/* Items for Purchase */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Premium Items Available for Purchase
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {demoItems.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      <CardDescription className="mt-2">
                        {item.description}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="ml-2">
                      ${(item.priceCents / 100).toFixed(2)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-medium">{item.category}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Difficulty:</span>
                      <span className="font-medium">{item.difficulty}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Rating:</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="font-medium">{item.rating}</span>
                        <span className="text-gray-500">({item.reviewCount})</span>
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <Button 
                    onClick={() => handlePurchaseItem(item)}
                    className="w-full"
                    variant="outline"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Purchase for ${(item.priceCents / 100).toFixed(2)}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>Secure Payments</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600">
                All payments are processed securely through Stripe with industry-standard encryption.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle>Instant Access</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600">
                Get immediate access to purchased content and subscription features.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle>Money Back Guarantee</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600">
                30-day money-back guarantee on all purchases and subscriptions.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Payment Modal */}
        <PaymentModal
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          mode={modalMode}
          itemData={selectedItem}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
      </div>
    </div>
  );
};

export default PaymentDemo;
