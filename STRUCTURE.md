# 📋 Project File Structure

```
foodfest-2026/
│
├── 📁 app/                          # Next.js 14 App Router
│   ├── 📁 api/                      # API Routes (Backend)
│   │   ├── 📁 foods/
│   │   │   └── route.js             # GET /api/foods
│   │   ├── 📁 orders/
│   │   │   ├── route.js             # POST /api/orders
│   │   │   └── 📁 [id]/
│   │   │       └── 📁 submit-utr/
│   │   │           └── route.js     # POST /api/orders/:id/submit-utr
│   │   └── 📁 admin/
│   │       ├── 📁 login/
│   │       │   └── route.js         # POST /api/admin/login
│   │       ├── 📁 orders/
│   │       │   ├── route.js         # GET /api/admin/orders
│   │       │   └── 📁 [id]/
│   │       │       ├── 📁 verify-payment/
│   │       │       │   └── route.js # PATCH /api/admin/orders/:id/verify-payment
│   │       │       ├── 📁 reject-payment/
│   │       │       │   └── route.js # PATCH /api/admin/orders/:id/reject-payment
│   │       │       └── 📁 status/
│   │       │           └── route.js # PATCH /api/admin/orders/:id/status
│   │       ├── 📁 foods/
│   │       │   └── 📁 [id]/
│   │       │       ├── 📁 toggle/
│   │       │       │   └── route.js # PATCH /api/admin/foods/:id/toggle
│   │       │       └── 📁 stock/
│   │       │           └── route.js # PATCH /api/admin/foods/:id/stock
│   │       └── 📁 stats/
│   │           └── route.js         # GET /api/admin/stats
│   │
│   ├── 📁 admin/                    # Admin Pages
│   │   ├── page.js                  # Admin Login Page
│   │   └── 📁 dashboard/
│   │       └── page.js              # Admin Dashboard
│   │
│   ├── layout.js                    # Root Layout (with Toaster)
│   ├── page.js                      # Home Page (User Side)
│   └── globals.css                  # Global Styles + Tailwind
│
├── 📁 components/                   # React Components
│   ├── FoodCard.js                  # Food Item Card with quantity selector
│   └── CheckoutModal.js             # Checkout + Payment + UTR Modal
│
├── 📁 models/                       # MongoDB Models
│   ├── Food.js                      # Food Item Schema
│   └── Order.js                     # Order Schema
│
├── 📁 lib/                          # Utilities
│   └── db.js                        # MongoDB Connection Handler
│
├── 📁 scripts/                      # Utility Scripts
│   └── seed.js                      # Database Seeding Script
│
├── 📁 public/                       # Static Assets (auto-created by Next.js)
│
├── 📄 package.json                  # Dependencies & Scripts
├── 📄 next.config.js                # Next.js Configuration
├── 📄 tailwind.config.js            # Tailwind CSS Configuration
├── 📄 postcss.config.js             # PostCSS Configuration
├── 📄 jsconfig.json                 # JavaScript Configuration (path aliases)
│
├── 📄 .env.local.example            # Environment Variables Template
├── 📄 .env.local                    # Environment Variables (create this)
├── 📄 .gitignore                    # Git Ignore Rules
│
├── 📄 README.md                     # Full Documentation
├── 📄 SETUP.md                      # Quick Start Guide
└── 📄 STRUCTURE.md                  # This File
```

## 🎯 Key Files Explained

### Frontend (User Side)
- **app/page.js** - Homepage with hero, food cards, and cart
- **components/FoodCard.js** - Individual food item display
- **components/CheckoutModal.js** - 3-step checkout flow (details → payment → UTR)

### Frontend (Admin Side)
- **app/admin/page.js** - Admin login page
- **app/admin/dashboard/page.js** - Full admin dashboard with stats and management

### Backend (API Routes)
All API routes are in `app/api/` directory:

**Public APIs:**
- `foods/route.js` - List all food items
- `orders/route.js` - Create new order
- `orders/[id]/submit-utr/route.js` - Submit UTR number

**Admin APIs:**
- `admin/login/route.js` - Admin authentication
- `admin/orders/route.js` - Get all orders
- `admin/orders/[id]/verify-payment/` - Verify payment
- `admin/orders/[id]/reject-payment/` - Reject payment
- `admin/orders/[id]/status/` - Update order status
- `admin/foods/[id]/toggle/` - Toggle food availability
- `admin/foods/[id]/stock/` - Update stock
- `admin/stats/route.js` - Dashboard statistics

### Database
- **models/Food.js** - Food item schema and validation
- **models/Order.js** - Order schema with auto-generated order IDs
- **lib/db.js** - MongoDB connection with caching

### Configuration
- **next.config.js** - Image domains and environment variables
- **tailwind.config.js** - Custom colors and theme
- **jsconfig.json** - Path aliases (@/ imports)

### Scripts
- **scripts/seed.js** - Populate database with initial food items

## 📦 Important Directories

### `/app/api/` 
Contains all backend API routes. Next.js automatically creates endpoints based on folder structure.

### `/components/`
Reusable React components for the frontend.

### `/models/`
MongoDB schemas using Mongoose ODM.

### `/lib/`
Utility functions and configurations (database connection).

## 🔄 Data Flow

```
User Flow:
Homepage → FoodCard → CheckoutModal → API (/api/orders) → MongoDB

Admin Flow:
Admin Login → Dashboard → API (/api/admin/*) → MongoDB
```

## 🚀 Getting Started

1. Run `npm install`
2. Create `.env.local` from `.env.local.example`
3. Run `npm run seed` to populate database
4. Run `npm run dev` to start server
5. Open http://localhost:3000

For detailed instructions, see [SETUP.md](./SETUP.md)
