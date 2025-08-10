import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from '@/contexts/AuthContext';
import { ChefHat } from 'lucide-react';
import { AUTH_CONFIG } from '@/config/auth';

export default function LoginModal({ isOpen, onOpenChange }) {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Initialize Google OAuth
      if (!window.google) {
        throw new Error('Google OAuth not loaded');
      }

      // Create Google OAuth client
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: AUTH_CONFIG.GOOGLE.CLIENT_ID,
        scope: AUTH_CONFIG.GOOGLE.SCOPE,
        callback: async (response) => {
          if (response.error) {
            throw new Error(response.error);
          }

          // Send the access token to our backend
          const result = await login(response.access_token);
          if (result.success) {
            onOpenChange(false);
          } else {
            setError(result.error || 'Login failed');
          }
        },
      });

      client.requestAccessToken();
    } catch (error) {
      console.error('Google login error:', error);
      setError(error.message || 'Failed to initialize Google login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white/90 backdrop-blur-md border-purple-200 shadow-2xl rounded-2xl">
        <DialogHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <ChefHat className="w-8 h-8 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold text-gray-900">Join the Community</DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            Please sign in to share your bakes and connect with other bakers.
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="mt-6">
          <Button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            size="lg"
            className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg hover:shadow-xl transition-all text-lg font-semibold py-6 rounded-xl disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Signing in...
              </div>
            ) : (
              <>
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}