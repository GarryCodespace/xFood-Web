import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "688e23e34d4e64379d391686", 
  requiresAuth: true // Ensure authentication is required for all operations
});
