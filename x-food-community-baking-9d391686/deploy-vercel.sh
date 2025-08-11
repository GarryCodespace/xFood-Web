#!/bin/bash

echo "🚀 Deploying xFood Community Baking to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Build the project
echo "📦 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful!"

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

echo "🎉 Deployment complete!"
echo "📝 Don't forget to set your environment variables in Vercel dashboard:"
echo "   - VITE_GOOGLE_CLIENT_ID"
echo "   - VITE_API_BASE_URL"
echo "   - VITE_STRIPE_PUBLISHABLE_KEY"
