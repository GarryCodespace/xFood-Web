# Create New Google OAuth Client for xFood

## Quick Setup Steps:

### 1. Go to Google Cloud Console
- Visit: https://console.cloud.google.com/
- Create a new project or select existing one

### 2. Enable Google Identity API
- Go to **APIs & Services** → **Library**
- Search for "Google Identity"
- Enable **Google Identity Toolkit API**

### 3. Configure OAuth Consent Screen
- Go to **APIs & Services** → **OAuth consent screen**
- Choose **External** user type
- Fill in required fields:
  - **App name**: `xFood Community Baking`
  - **User support email**: Your email
  - **Developer contact**: Your email
- Save and continue through all steps

### 4. Create OAuth 2.0 Client ID
- Go to **APIs & Services** → **Credentials**
- Click **+ CREATE CREDENTIALS** → **OAuth 2.0 Client IDs**
- Choose **Web application**
- **Name**: `xFood Web Client`
- **Authorized JavaScript origins**:
  ```
  http://localhost:5173
  http://localhost:3000
  http://127.0.0.1:5173
  http://127.0.0.1:3000
  ```
- Click **CREATE**

### 5. Copy the Client ID
Copy the generated Client ID and update your .env files:

**Frontend (.env in x-food-community-baking-9d391686/):**
```env
VITE_GOOGLE_CLIENT_ID=YOUR_NEW_CLIENT_ID_HERE
```

**Backend (.env in root):**
```env
GOOGLE_CLIENT_ID=YOUR_NEW_CLIENT_ID_HERE
```

### 6. Test the Integration
1. Restart both frontend and backend servers
2. Try Google login again

## Security Notes:
- The Client ID is safe to use in frontend code
- Never commit real credentials to version control
- Use environment variables for all configuration