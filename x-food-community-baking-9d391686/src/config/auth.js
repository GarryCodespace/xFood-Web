// Authentication configuration
export const AUTH_CONFIG = {
  // Google Identity Services Configuration
  GOOGLE: {
    CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
  },
  
  // Apple Sign-In Configuration
  APPLE: {
    CLIENT_ID: import.meta.env.VITE_APPLE_CLIENT_ID || 'YOUR_APPLE_CLIENT_ID',
    REDIRECT_URI: import.meta.env.VITE_APPLE_REDIRECT_URI || 'https://your-domain.com/auth/apple/callback',
  },
  
  // API Configuration
  API: {
    BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001',
  },
};

// Instructions for setup:
// 1. Create a .env file in the root directory
// 2. Add: VITE_GOOGLE_CLIENT_ID=your_actual_client_id_here
// 3. Add: VITE_APPLE_CLIENT_ID=com.yourapp.identifier
// 4. Add: VITE_APPLE_REDIRECT_URI=https://your-domain.com/auth/apple/callback
// 5. Add: VITE_API_BASE_URL=http://localhost:8001
// 6. Replace values with your actual OAuth configurations
