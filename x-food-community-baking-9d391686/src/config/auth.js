// Authentication configuration
export const AUTH_CONFIG = {
  // Google Identity Services Configuration
  GOOGLE: {
    CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
  },
  
  // API Configuration
  API: {
    BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001',
  },
};

// Instructions for setup:
// 1. Create a .env file in the root directory
// 2. Add: VITE_GOOGLE_CLIENT_ID=your_actual_client_id_here
// 3. Add: VITE_API_BASE_URL=http://localhost:8000
// 4. Replace 'your_actual_client_id_here' with your Google OAuth client ID
