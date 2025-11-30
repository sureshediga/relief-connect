#!/bin/bash

# Relief Connect Setup Script
# This script sets up the development environment for Relief Connect

set -e

echo "🚀 Setting up Relief Connect..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL 14+ first."
    exit 1
fi

echo "✅ PostgreSQL detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Copy environment file
if [ ! -f .env.local ]; then
    echo "📝 Creating environment file..."
    cp env.example .env.local
    echo "⚠️  Please update .env.local with your configuration"
else
    echo "✅ Environment file already exists"
fi

# Generate Prisma client
echo "🗄️  Generating Prisma client..."
npx prisma generate

# Check if database is accessible
echo "🔍 Checking database connection..."
if npx prisma db push --accept-data-loss &> /dev/null; then
    echo "✅ Database connection successful"
else
    echo "❌ Database connection failed. Please check your DATABASE_URL in .env.local"
    echo "   Example: postgresql://username:password@localhost:5432/relief_connect"
    exit 1
fi

# Run database migrations
echo "🔄 Running database migrations..."
npx prisma db push

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env.local with your configuration"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "For more information, see README.md"
