# Google OAuth Setup Guide

## 1. Create Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Identity Services API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Identity Services API"
   - Click on it and press "Enable"

## 2. Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type
3. Fill in the required fields:
   - App name: "xFood Community Baking"
   - User support email: Your email
   - Developer contact information: Your email
4. Add scopes (optional for basic info)
5. Save and continue

## 3. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add authorized origins:
   - `http://localhost:5173` (for development)
   - `http://localhost:3000` (alternative dev port)
   - Your production domain when ready
5. Copy the Client ID

## 4. Configure Environment Variables

### Frontend (.env in x-food-community-baking-9d391686/)
```env
VITE_GOOGLE_CLIENT_ID=your_actual_google_client_id_here
VITE_API_BASE_URL=http://localhost:8000
```

### Backend (.env in root directory)
```env
# Add to your existing .env file
GOOGLE_OAUTH_CLIENT_ID=your_actual_google_client_id_here
```

## 5. Test the Integration

1. Start the backend: `python app/main.py`
2. Start the frontend: `cd x-food-community-baking-9d391686 && npm run dev`
3. Try signing in with Google

## Security Notes

- Never commit your actual Client ID to version control
- Use environment variables for all sensitive configuration
- The Client ID is safe to use in frontend code as it's designed to be public
- Keep your Client Secret (if you have one) secure and server-side only

## Troubleshooting

- **"Error 400: redirect_uri_mismatch"**: Make sure your authorized origins in Google Console match exactly
- **"Error 403: access_blocked"**: Your OAuth consent screen might need verification for external users
- **"Error loading Google Identity Services"**: Check your internet connection and Client ID