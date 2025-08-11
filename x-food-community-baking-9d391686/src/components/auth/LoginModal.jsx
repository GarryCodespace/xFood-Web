import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from '@/contexts/AuthContext';
import { ChefHat } from 'lucide-react';
import { AUTH_CONFIG } from '@/config/auth';

export default function LoginModal({ isOpen, onOpenChange }) {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Initialize Google Identity Services when component mounts
    if (window.google && AUTH_CONFIG.GOOGLE.CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID') {
      try {
        window.google.accounts.id.initialize({
          client_id: AUTH_CONFIG.GOOGLE.CLIENT_ID,
          callback: handleCredentialResponse,
          use_fedcm_for_prompt: false
        });
        console.log('Google Identity Services initialized with client ID:', AUTH_CONFIG.GOOGLE.CLIENT_ID);
      } catch (error) {
        console.error('Failed to initialize Google Identity Services:', error);
        setError('Google OAuth initialization failed. Please refresh the page.');
      }
    } else {
      console.log('Google Identity Services not available or client ID not configured');
    }
  }, []);

  const handleCredentialResponse = async (response) => {
    setIsLoading(true);
    setError('');

    try {
      const result = await login(response.credential);
      if (result.success) {
        onOpenChange(false);
        // Navigate to profile after successful login
        window.location.href = '/Profile';
      } else {
        setError(result.error || 'Google login failed');
      }
    } catch (error) {
      console.error('Google login error:', error);
      setError('Google login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!window.google) {
      setError('Google Identity Services not loaded. Please refresh the page and try again.');
      return;
    }

    if (AUTH_CONFIG.GOOGLE.CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID') {
      setError('Google OAuth needs to be configured. Please follow the instructions in CREATE_GOOGLE_OAUTH.md to set up your own Google Client ID, or try the demo login below.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('Attempting Google login with client ID:', AUTH_CONFIG.GOOGLE.CLIENT_ID);
      // Use Google One Tap
      window.google.accounts.id.prompt((notification) => {
        console.log('Google prompt notification:', notification);
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Fallback to popup
          console.log('One Tap not available, falling back to popup');
          window.google.accounts.id.renderButton(
            document.getElementById('google-signin-button'),
            { theme: 'outline', size: 'large' }
          );
          setIsLoading(false);
        }
      });
    } catch (error) {
      console.error('Google OAuth error:', error);
      setError(`Failed to initialize Google login: ${error.message}`);
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Create a demo login for testing
      const result = await login('demo_token');
      if (result.success) {
        onOpenChange(false);
        // Navigate to profile after successful login
        window.location.href = '/Profile';
      } else {
        setError(result.error || 'Demo login failed');
      }
    } catch (error) {
      console.error('Demo login error:', error);
      setError(error.message || 'Demo login failed');
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

        <div className="mt-6 space-y-4">
          <Button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            size="lg"
            variant="outline"
            className="w-full border-2 border-gray-300 text-gray-600 shadow-lg hover:shadow-xl transition-all text-lg font-semibold py-6 rounded-xl disabled:opacity-50"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {isLoading ? 'Signing in...' : 'Continue with Google'}
          </Button>
          
          {/* Fallback Google Sign-In Button Container */}
          <div id="google-signin-button" className="w-full"></div>
          
          <Button
            onClick={handleDemoLogin}
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
                <ChefHat className="w-5 h-5 mr-3" />
                Try Demo Login
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}