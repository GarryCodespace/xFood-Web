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

  // Check for existing authentication on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        // Verify token with backend
        const response = await fetch(`${AUTH_CONFIG.API.BASE_URL}/api/v1/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          // Invalid token, remove it
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
    } finally {
      setLoading(false);
    }
  };

  const login = async (token, provider = 'google') => {
    try {
      console.log('AuthContext: Starting login process for provider:', provider);
      setLoading(true);
      
      let endpoint = `${AUTH_CONFIG.API.BASE_URL}/api/v1/auth/google`;
      let body = JSON.stringify({ id_token: token });
      
      // Handle demo login
      if (token === 'demo_token') {
        endpoint = `${AUTH_CONFIG.API.BASE_URL}/api/v1/auth/demo`;
        body = '{}';
      }
      // Handle Apple login
      else if (provider === 'apple') {
        endpoint = `${AUTH_CONFIG.API.BASE_URL}/api/v1/auth/apple`;
        body = JSON.stringify({ id_token: token });
      }
      
      console.log('AuthContext: Making request to:', endpoint);
      console.log('AuthContext: Request body:', body);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: body,
      });

      console.log('AuthContext: Response status:', response.status);
      console.log('AuthContext: Response headers:', response.headers);

      if (response.ok) {
        const data = await response.json();
        console.log('AuthContext: Login successful, data:', data);
        
        // Store tokens
        localStorage.setItem('authToken', data.access_token);
        localStorage.setItem('refreshToken', data.refresh_token);
        
        // Get user data
        await checkAuthStatus();
        
        return { success: true };
      } else {
        const errorData = await response.json();
        console.error('AuthContext: Login failed with status:', response.status, 'Error:', errorData);
        return { success: false, error: errorData.detail || 'Login failed' };
      }
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      return { success: false, error: `Network error: ${error.message}` };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
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
