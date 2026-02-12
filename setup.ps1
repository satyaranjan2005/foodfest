# FoodFest 2026 - Automated Setup Script for Windows
# Run this script in PowerShell

Write-Host "🍔 FoodFest 2026 - Automated Setup" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from: https://nodejs.org" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit
}

# Check if MongoDB is installed
Write-Host ""
Write-Host "Checking MongoDB installation..." -ForegroundColor Yellow
try {
    $mongoVersion = mongod --version
    Write-Host "✅ MongoDB installed" -ForegroundColor Green
} catch {
    Write-Host "⚠️  MongoDB not found locally" -ForegroundColor Yellow
    Write-Host "You can either:" -ForegroundColor Yellow
    Write-Host "  1. Install MongoDB locally: https://www.mongodb.com/try/download/community" -ForegroundColor Cyan
    Write-Host "  2. Use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas" -ForegroundColor Cyan
}

# Install dependencies
Write-Host ""
Write-Host "Installing npm packages..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Packages installed successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install packages" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit
}

# Create .env.local if it doesn't exist
Write-Host ""
if (!(Test-Path ".env.local")) {
    Write-Host "Creating .env.local file..." -ForegroundColor Yellow
    
    # Get UPI ID from user
    $upiId = Read-Host "Enter your UPI ID (e.g., yourname@paytm)"
    if ([string]::IsNullOrWhiteSpace($upiId)) {
        $upiId = "yourname@paytm"
        Write-Host "⚠️  Using default UPI ID. Please update .env.local later!" -ForegroundColor Yellow
    }
    
    # Get admin password
    $adminPass = Read-Host "Enter admin password (default: admin123)"
    if ([string]::IsNullOrWhiteSpace($adminPass)) {
        $adminPass = "admin123"
    }
    
    # Get MongoDB URI
    Write-Host ""
    Write-Host "MongoDB Connection:" -ForegroundColor Cyan
    Write-Host "  1. Local: mongodb://localhost:27017/foodfest2026" -ForegroundColor Cyan
    Write-Host "  2. Atlas: mongodb+srv://..." -ForegroundColor Cyan
    $mongoUri = Read-Host "Enter MongoDB URI (press Enter for local)"
    if ([string]::IsNullOrWhiteSpace($mongoUri)) {
        $mongoUri = "mongodb://localhost:27017/foodfest2026"
    }
    
    # Create .env.local content
    $envContent = @"
MONGODB_URI=$mongoUri
ADMIN_PASSWORD=$adminPass
UPI_ID=$upiId
NEXT_PUBLIC_UPI_ID=$upiId
NODE_ENV=development
"@
    
    $envContent | Out-File -FilePath ".env.local" -Encoding UTF8
    Write-Host "✅ .env.local file created!" -ForegroundColor Green
} else {
    Write-Host "✅ .env.local file already exists" -ForegroundColor Green
}

# Ask if user wants to seed database
Write-Host ""
$seedDb = Read-Host "Do you want to seed the database with sample food items? (Y/n)"
if ($seedDb -eq "" -or $seedDb -eq "Y" -or $seedDb -eq "y") {
    Write-Host "Seeding database..." -ForegroundColor Yellow
    node scripts/seed.js
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database seeded successfully!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Failed to seed database. Make sure MongoDB is running!" -ForegroundColor Yellow
    }
}

# Summary
Write-Host ""
Write-Host "=================================" -ForegroundColor Green
Write-Host "✨ Setup Complete!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Make sure MongoDB is running" -ForegroundColor White
Write-Host "  2. Run: npm run dev" -ForegroundColor White
Write-Host "  3. Open: http://localhost:3000" -ForegroundColor White
Write-Host "  4. Admin: http://localhost:3000/admin" -ForegroundColor White
Write-Host ""
Write-Host "Admin Password: Check .env.local file" -ForegroundColor Yellow
Write-Host ""

# Ask if user wants to start dev server
$startDev = Read-Host "Start development server now? (Y/n)"
if ($startDev -eq "" -or $startDev -eq "Y" -or $startDev -eq "y") {
    Write-Host ""
    Write-Host "Starting development server..." -ForegroundColor Green
    Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
    Write-Host ""
    npm run dev
} else {
    Write-Host ""
    Write-Host "Run 'npm run dev' when you're ready to start!" -ForegroundColor Cyan
    Write-Host ""
}
