import React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Crown, Zap, Users, BookOpen } from 'lucide-react';

const SubscriptionPaywall = ({ onSubscribe, showFirstPostBanner = false }) => {
  if (showFirstPostBanner) {
    return (
      <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-yellow-50 to-orange-50 border-orange-200">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <Zap className="w-6 h-6 text-yellow-600" />
          </div>
          <CardTitle className="text-xl text-orange-800">🎉 You have 1 free post!</CardTitle>
          <CardDescription className="text-orange-600">
            Use your free post to share your first creation with the community
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button 
            onClick={onSubscribe} 
            className="w-full bg-orange-600 hover:bg-orange-700"
          >
            Post Now (Free)
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
          <Crown className="w-6 h-6 text-purple-600" />
        </div>
        <CardTitle className="text-xl text-purple-800">Get Unlimited Posts</CardTitle>
        <CardDescription className="text-purple-600">
          Subscribe to unlock unlimited posting and premium content access
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Zap className="w-5 h-5 text-purple-600" />
            <span className="text-sm text-gray-700">Unlimited posts</span>
          </div>
          <div className="flex items-center space-x-3">
            <BookOpen className="w-5 h-5 text-purple-600" />
            <span className="text-sm text-gray-700">Access to premium recipes</span>
          </div>
          <div className="flex items-center space-x-3">
            <Users className="w-5 h-5 text-purple-600" />
            <span className="text-sm text-gray-700">Priority community access</span>
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-800">$5.99</div>
          <div className="text-sm text-gray-600">per month</div>
        </div>
        
        <Button 
          onClick={onSubscribe} 
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          Subscribe Now
        </Button>
        
        <p className="text-xs text-center text-gray-500">
          Cancel anytime. No commitment required.
        </p>
      </CardContent>
    </Card>
  );
};

export default SubscriptionPaywall;
