#!/bin/bash

# MultiTenant Platform - Quick Start Script
# Usage: ./setup.sh

set -e

echo "🚀 MultiTenant Platform - Setup Script"
echo "========================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm version: $(npm -v)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo ""
    echo "📝 Creating .env.local file..."
    cp .env.example .env.local
    
    # Generate random secrets
    JWT_SECRET=$(node -e 'console.log(require("crypto").randomBytes(32).toString("hex"))')
    NEXTAUTH_SECRET=$(node -e 'console.log(require("crypto").randomBytes(32).toString("hex"))')
    
    # Update .env.local with generated secrets
    sed -i.bak "s/your-secret-key-here-change-in-production/$JWT_SECRET/" .env.local
    sed -i.bak "s/your-nextauth-secret-here/$NEXTAUTH_SECRET/" .env.local
    
    echo "✅ .env.local created with generated secrets"
    echo ""
    echo "⚠️  Update DATABASE_URL in .env.local before proceeding!"
else
    echo "✅ .env.local already exists"
fi

# Check if Prisma is set up
if [ ! -d "node_modules/@prisma" ]; then
    echo "📦 Setting up Prisma..."
    npx prisma generate
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📖 Next steps:"
echo "1. Update DATABASE_URL in .env.local"
echo "2. Run: npx prisma migrate dev"
echo "3. Run: npm run dev"
echo ""
echo "🌐 Access the app at:"
echo "   http://localhost:3000"
