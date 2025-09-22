#!/bin/bash

# Sorella Home Solutions - S3 Deployment Script

echo "🏠 Deploying Sorella Home Solutions to S3"
echo "========================================"

# Build the application
echo "📦 Building application..."
npm run build

# Check if build was successful
if [ $? -ne 0 ]; then
    echo "❌ Build failed. Deployment aborted."
    exit 1
fi

echo "✅ Build completed successfully"

# Deploy to S3 (you'll need to replace YOUR_BUCKET_NAME with your actual bucket name)
echo "🚀 Deploying to S3..."

# Sync the dist folder to S3 bucket (excluding large video files for faster deployment)
aws s3 sync dist/sorella-home-solutions/browser/ s3://sorellahomesolutions.com --delete --exclude "*.mp4" --exclude "*.MP4"

if [ $? -eq 0 ]; then
    echo "✅ Successfully deployed to S3!"
    
    # Configure S3 for SPA routing
    echo "🔧 Configuring S3 for SPA routing..."
    aws s3 website s3://sorellahomesolutions.com \
      --index-document index.html \
      --error-document index.html
    
    if [ $? -eq 0 ]; then
        echo "✅ S3 SPA routing configured successfully!"
    else
        echo "⚠️  Warning: SPA routing configuration may have failed, but deployment was successful."
    fi
    
    echo "🌐 Your site should be live at: https://sorellahomesolutions.com"
else
    echo "❌ Deployment failed. Please check your AWS credentials and bucket permissions."
    exit 1
fi

echo ""
echo "🎉 Deployment completed successfully!"