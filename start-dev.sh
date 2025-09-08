#!/bin/bash

# Sorella Home Solutions - Development Startup Script

echo "🏠 Starting Sorella Home Solutions Development Environment"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if Angular CLI is installed
if ! command -v ng &> /dev/null; then
    echo "❌ Angular CLI is not installed. Installing..."
    npm install -g @angular/cli
fi

echo "📧 Starting Backend Server..."
cd server
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Creating from template..."
    cp .env.example .env
    echo "📝 Please edit server/.env with your Gmail credentials"
fi

# Start backend server in background
node server.js &
BACKEND_PID=$!
echo "✅ Backend server started (PID: $BACKEND_PID)"

# Wait a moment for backend to start
sleep 2

# Check if backend is running
if curl -s http://localhost:3001/api/health > /dev/null; then
    echo "✅ Backend server is responding"
else
    echo "❌ Backend server failed to start"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo ""
echo "🌐 Starting Frontend Server..."
cd ..

# Start Angular development server
echo "✅ Frontend server starting on http://localhost:4200"
echo "✅ Backend API running on http://localhost:3001"
echo ""
echo "📧 Email Configuration Status:"
if grep -q "your-email@gmail.com" server/.env; then
    echo "⚠️  Gmail credentials not configured yet"
    echo "   Edit server/.env with your actual Gmail credentials"
else
    echo "✅ Gmail credentials configured"
fi

echo ""
echo "🚀 Ready! Visit http://localhost:4200/contact to test the form"
echo "Press Ctrl+C to stop both servers"

# Start Angular dev server (this will run in foreground)
ng serve

# Cleanup: Kill backend server when Angular server stops
echo ""
echo "🛑 Stopping servers..."
kill $BACKEND_PID 2>/dev/null
echo "✅ All servers stopped"