# 🍔 FoodFest 2026 Ordering System

A complete full-stack food ordering website built with **Next.js 14** (App Router), **Firebase Firestore**, and **UPI payment integration**. This system is designed for college FoodFest events with simple UPI redirect payments (no payment gateway required).

## ✨ Features

### User Side
- 🏠 **Homepage** with hero section and food menu
- 🍕 **Food Cards** with images, prices, stock availability
- 🛒 **Shopping Cart** with quantity selection
- 💳 **UPI Payment** via deep link redirect or QR code
- 📱 **Mobile Responsive** design
- 🧾 **UTR Submission** for payment verification
- 📊 **Stock Management** (auto-disable when out of stock)

### Admin Panel
- 🔐 **Secure Login** (password-protected)
- 📈 **Dashboard Statistics**:
  - Total Orders
  - Pending Verifications
  - Accepted Orders
  - Completed Orders
  - Total Revenue
- ✅ **Payment Verification** (approve/reject UTR)
- 🔄 **Order Status Management** (placed → accepted → completed)
- 🍱 **Food Management**:
  - Toggle availability
  - Update stock
  - Auto-disable when stock = 0
- 🔄 **Auto-refresh** every 5 seconds
- 📋 **Complete Orders Table** with all details

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **Backend**: Next.js API Routes (serverless)
- **Database**: Firebase Firestore
- **Payments**: UPI Deep Links (no payment gateway)
- **UI**: React Hot Toast, QRCode.react

## 📁 Project Structure

```
foodfest-2026/
├── app/
│   ├── api/
│   │   ├── foods/
│   │   │   └── route.js
│   │   ├── orders/
│   │   │   ├── route.js
│   │   │   └── [id]/
│   │   │       └── submit-utr/
│   │   │           └── route.js
│   │   └── admin/
│   │       ├── login/
│   │       │   └── route.js
│   │       ├── orders/
│   │       │   ├── route.js
│   │       │   └── [id]/
│   │       │       ├── verify-payment/
│   │       │       ├── reject-payment/
│   │       │       └── status/
│   │       ├── foods/
│   │       │   └── [id]/
│   │       │       ├── toggle/
│   │       │       └── stock/
│   │       └── stats/
│   │           └── route.js
│   ├── admin/
│   │   ├── page.js (login)
│   │   └── dashboard/
│   │       └── page.js
│   ├── layout.js
│   ├── page.js (homepage)
│   └── globals.css
├── components/
│   ├── FoodCard.js
│   └── CheckoutModal.js
├── lib/
│   └── db.js (Firebase configuration)
├── scripts/
│   └── seed.js
├── package.json
├── next.config.js
├── tailwind.config.js
└── .env.local
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- Firebase project with Firestore enabled (see [FIREBASE_SETUP.md](FIREBASE_SETUP.md))

### Installation

1. **Clone/Navigate to the project folder**:
   ```bash
   cd "C:\Users\satya\Desktop\New folder (4)"
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create environment file**:
   ```bash
   copy .env.example .env.local
   ```

4. **Configure `.env.local`** (see [FIREBASE_SETUP.md](FIREBASE_SETUP.md) for detailed instructions):
   ```env
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=your-client-email@your-project-id.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key\n-----END PRIVATE KEY-----\n"
   ADMIN_PASSWORD=admin123
   UPI_ID=yourname@paytm
   NEXT_PUBLIC_UPI_ID=yourname@paytm
   NODE_ENV=development
   ```

   **Important**: 
   - Get Firebase credentials from Firebase Console (see [FIREBASE_SETUP.md](FIREBASE_SETUP.md))
   - Replace `yourname@paytm` with your actual UPI ID!

5. **Seed the database**:
   ```bash
   npm run seed
   ```

6. **Run the development server**:
   ```bash
   npm run dev
   ```

7. **Open your browser**:
   - User Site: http://localhost:3000
   - Admin Panel: http://localhost:3000/admin

## 🔑 Default Credentials

- **Admin Password**: `admin123` (change in `.env.local`)

## 📱 UPI Payment Flow

1. User selects food items and proceeds to checkout
2. Enters name and phone number
3. Order is created with status `pending`
4. User is redirected to UPI app via deep link
5. After payment, user submits UTR (Transaction ID)
6. Admin verifies payment in dashboard
7. Admin accepts order → marks as completed

## 🗂️ Firestore Collections

### Foods Collection
```javascript
{
  name: String,
  price: Number,
  image: String,
  isAvailable: Boolean,
  stock: Number,
  createdAt: String (ISO date),
  updatedAt: String (ISO date)
}
```

### Orders Collection
```javascript
{
  orderId: String, // Auto-generated (FF-001, FF-002, etc.)
  customerName: String,
  phone: String,
  items: [{
    foodId: String, // Firebase document ID
    foodName: String,
    quantity: Number,
    price: Number
  }],
  totalAmount: Number,
  paymentStatus: 'pending' | 'pending_verification' | 'paid' | 'rejected',
  orderStatus: 'placed' | 'accepted' | 'completed',
  utrNumber: String,
  createdAt: String (ISO date),
  updatedAt: String (ISO date)
}
```

## 🎯 API Routes

### Public Routes
- `GET /api/foods` - Get all food items
- `POST /api/orders` - Create new order
- `POST /api/orders/:id/submit-utr` - Submit UTR number

### Admin Routes (Protected)
- `POST /api/admin/login` - Admin login
- `GET /api/admin/orders` - Get all orders
- `GET /api/admin/stats` - Get dashboard statistics
- `PATCH /api/admin/orders/:id/verify-payment` - Verify payment
- `PATCH /api/admin/orders/:id/reject-payment` - Reject payment
- `PATCH /api/admin/orders/:id/status` - Update order status
- `PATCH /api/admin/foods/:id/toggle` - Toggle food availability
- `PATCH /api/admin/foods/:id/stock` - Update food stock

## 🎨 Customization

### Change Food Items

Edit `scripts/seed.js` and run:
```bash
node scripts/seed.js
```

### Change Colors

Edit `tailwind.config.js`:
```javascript
colors: {
  primary: '#F97316',    // Orange
  secondary: '#FB923C',  // Light Orange
}
```

### Change Admin Password

Update `.env.local`:
```env
ADMIN_PASSWORD=your_secure_password
```

## 🔒 Security Features

- Input validation on all API routes
- Duplicate UTR prevention
- Stock validation before order creation
- Protected admin routes with token authentication
- Phone number validation (10-digit Indian numbers)
- Prevent negative stock
- Sanitized user inputs

## 📦 Production Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/foodfest
ADMIN_PASSWORD=your_secure_password
UPI_ID=your@upi
NEXT_PUBLIC_UPI_ID=your@upi
NODE_ENV=production
```

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod`
- Check `MONGODB_URI` in `.env.local`

### Images Not Loading
- Check internet connection (using Unsplash CDN)
- Update image URLs in seed script if needed

### UPI Payment Not Working on Desktop
- UPI deep links work best on mobile devices
- Use QR code for desktop users

### Admin Can't Login
- Verify `ADMIN_PASSWORD` in `.env.local`
- Clear browser localStorage and try again

## 📝 License

MIT License - feel free to use for your college events!

## 👨‍💻 Support

For issues or questions, please create an issue in the repository.

---

**Built with ❤️ for FoodFest 2026**
