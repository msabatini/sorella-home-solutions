#!/bin/bash

# Configure S3 bucket for Single Page Application routing
echo "🔧 Configuring S3 bucket for SPA routing..."

# Set the error document to index.html so Angular router can handle all routes
aws s3 website s3://sorellahomesolutions.com \
  --index-document index.html \
  --error-document index.html

echo "✅ S3 bucket configured for SPA routing"
echo "📝 All 404 errors will now serve index.html, allowing Angular router to handle routing"