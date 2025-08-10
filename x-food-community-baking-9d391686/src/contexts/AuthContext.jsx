import React, { createContext, useContext, useState, useEffect } from 'react';
import { AUTH_CONFIG } from '@/config/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (from localStorage or session)
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          // Verify token with backend
          const response = await fetch(`${AUTH_CONFIG.API.BASE_URL}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            // Token is invalid, remove it
            localStorage.removeItem('authToken');
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('authToken');
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (googleToken) => {
    try {
      // For now, since we don't have Google OAuth backend endpoint,
      // we'll create a mock login for development
      console.log('Google OAuth not yet implemented on backend, using mock login');
      
      // Mock user data for development
      const mockUser = {
        id: 1,
        email: 'user@example.com',
        full_name: 'Test User',
        avatar_url: null,
        location: 'Test Location',
        bio: 'Test bio',
        rating: 5.0,
        review_count: 0,
        is_verified: true,
        role: 'user',
        dietary_preferences: [],
        join_date: new Date().toISOString()
      };
      
      // Mock token
      const mockToken = 'mock_token_' + Date.now();
      
      localStorage.setItem('authToken', mockToken);
      setUser(mockUser);
      return { success: true };
      
      // TODO: Uncomment when backend Google OAuth is implemented
      /*
      const response = await fetch(`${AUTH_CONFIG.API.BASE_URL}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: googleToken }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('authToken', data.access_token);
        setUser(data.user);
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.detail || 'Login failed' };
      }
      */
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error' };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
