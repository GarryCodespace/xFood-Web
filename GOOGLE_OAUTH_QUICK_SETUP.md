# Google OAuth Quick Setup Guide for xFood Community Baking

## 🚀 **Your Domain is Now Connected!**
**✅ xfood.dev is successfully connected to your Vercel deployment**

## 📋 **Step-by-Step Google OAuth Setup**

### 1. **Go to Google Cloud Console**
- Visit: https://console.cloud.google.com/
- Sign in with your Google account
- Select your project (or create one if needed)

### 2. **Enable Google Identity Services API**
- Go to "APIs & Services" → "Library"
- Search for "Google Identity Toolkit API"
- Click on it and press "Enable"

### 3. **Configure OAuth Consent Screen**
- Go to "APIs & Services" → "OAuth consent screen"
- Choose "External" user type
- Fill in app details:
  - **App name:** xFood Community Baking
  - **User support email:** your-email@gmail.com
  - **Developer contact information:** your-email@gmail.com
- Save and continue

### 4. **Create OAuth 2.0 Client ID**
- Go to "APIs & Services" → "Credentials"
- Click "+ CREATE CREDENTIALS" → "OAuth 2.0 Client IDs"
- Choose "Web application"
- **Name:** xFood Community Baking Web Client

### 5. **Add Authorized JavaScript Origins**
**IMPORTANT:** Add ALL these URLs:
```
http://localhost:5173
http://localhost:5174
https://x-food-community-baking-9d391686.vercel.app
https://x-food-community-baking-9d391686-blp11hzgs-garrys-projects.vercel.app
https://xfood.dev
```

### 6. **Add Authorized Redirect URIs**
```
http://localhost:5173
http://localhost:5174
https://xfood.dev
```

### 7. **Copy Your Client ID**
- After creating, copy the generated Client ID
- It looks like: `123456789-abcdefghijklmnop.apps.googleusercontent.com`

### 8. **Update Environment Variables**

#### **Frontend (.env file):**
```env
VITE_GOOGLE_CLIENT_ID=your_actual_client_id_here
VITE_API_BASE_URL=http://localhost:8000
```

#### **Backend (.env file):**
```env
GOOGLE_CLIENT_ID=your_actual_client_id_here
```

### 9. **Restart Your Servers**
- Restart both frontend and backend
- Test Google Sign-In on both localhost and xfood.dev

## 🌐 **Your Live URLs:**
- **Production:** https://xfood.dev ✅
- **Local Development:** http://localhost:5174 ✅
- **Backend API:** http://localhost:8000 ✅

## 🔍 **Test Your Setup:**
1. **Local:** Go to http://localhost:5174 and try Google Sign-In
2. **Production:** Go to https://xfood.dev and try Google Sign-In
3. **Both should work** with the same Google Client ID

## ❗ **Common Issues:**
- **"Origin mismatch" error:** Make sure ALL URLs are in "Authorized JavaScript origins"
- **"Client not found" error:** Check that your Client ID is correct in both .env files
- **"Redirect URI mismatch" error:** Add all your domains to "Authorized redirect URIs"

## 🎯 **Next Steps:**
1. Update your Google OAuth configuration with the URLs above
2. Test Google Sign-In on both localhost and xfood.dev
3. Let me know if you encounter any issues!

---
**Need help?** The domain is connected, now just configure Google OAuth! 🚀
