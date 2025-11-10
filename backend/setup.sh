#!/bin/bash
# Complete setup script for Dolapo's Portfolio Backend

echo "=================================="
echo "Dolapo's Portfolio - Backend Setup"
echo "=================================="
echo ""

# Step 1: Check Node.js
echo "Step 1: Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi
echo "✓ Node.js version: $(node --version)"
echo ""

# Step 2: Install dependencies
echo "Step 2: Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi
echo "✓ Dependencies installed"
echo ""

# Step 3: Copy .env.example to .env if it doesn't exist
echo "Step 3: Setting up environment variables..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✓ Created .env file from .env.example"
else
    echo "✓ .env file already exists"
fi
echo ""

# Step 4: Initialize database and create admin account
echo "Step 4: Initialize database and create admin account..."
echo ""
echo "You will be prompted to create your admin account:"
echo "  - Username: Your admin username (e.g., 'dolapo')"
echo "  - Password: Your secure password"
echo "  - Secret Path: Unique URL path (e.g., 'dolapo-admin-2024')"
echo ""
echo "IMPORTANT: Save your secret path! It's your only way to access the admin panel."
echo "Your admin URL will be: http://localhost:5173/admin/YOUR-SECRET-PATH"
echo ""
read -p "Press Enter to continue..."

npm run init-db
if [ $? -ne 0 ]; then
    echo "❌ Failed to initialize database"
    exit 1
fi
echo ""

# Step 5: Verify database was created
echo "Step 5: Verifying database..."
if [ -f data/portfolio.db ]; then
    echo "✓ Database created successfully at: backend/data/portfolio.db"
    echo "  File size: $(ls -lh data/portfolio.db | awk '{print $5}')"
else
    echo "❌ Database file not found. Something went wrong."
    exit 1
fi
echo ""

echo "=================================="
echo "✅ Setup Complete!"
echo "=================================="
echo ""
echo "Next steps:"
echo "  1. Start the backend:    npm run dev"
echo "  2. Start the frontend:   cd ../frontend && npm run dev"
echo "  3. Access admin at:      http://localhost:5173/admin/YOUR-SECRET-PATH"
echo ""
echo "Need help? Check backend/README.md or STORAGE_GUIDE.md"
echo ""
