# 🚀 Quick Start Guide

## First Time Setup (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Create Environment File
```bash
# Copy the example file
copy .env.local.example .env.local

# Edit .env.local and add your UPI ID
# Replace: yourname@paytm with your actual UPI ID
```

### 3. Start MongoDB
```bash
# If using local MongoDB
mongod

# OR use MongoDB Atlas (cloud) - update MONGODB_URI in .env.local
```

### 4. Seed Database
```bash
node scripts/seed.js
```

### 5. Run Development Server
```bash
npm run dev
```

### 6. Open in Browser
- **User Site**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin
- **Admin Password**: `admin123`

---

## 🎯 Testing the Complete Flow

### As a Customer:
1. Go to http://localhost:3000
2. Click + buttons to add food items
3. Click "Proceed to Checkout"
4. Enter name and phone number
5. Click "Proceed to Pay"
6. You'll see order ID and UPI payment options
7. Click "I've Already Paid - Submit UTR"
8. Enter any test UTR like `123456789012`
9. Submit

### As Admin:
1. Go to http://localhost:3000/admin
2. Login with password: `admin123`
3. See the order in "Pending Verification"
4. Click "Verify" to approve payment
5. Click "Accept Order" to accept
6. Click "Mark Complete" to complete

---

## 🔧 Common Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Seed database with food items
node scripts/seed.js
```

---

## 📱 Mobile Testing

To test on mobile device on same network:

1. Find your computer's IP address:
   ```bash
   ipconfig
   ```

2. Look for IPv4 Address (e.g., 192.168.1.5)

3. On mobile, open:
   ```
   http://YOUR_IP:3000
   ```

UPI payment will work properly on mobile devices!

---

## ⚙️ Configuration

### Change Admin Password
Edit `.env.local`:
```env
ADMIN_PASSWORD=your_new_password
```

### Change UPI ID
Edit `.env.local`:
```env
UPI_ID=your@upiid
NEXT_PUBLIC_UPI_ID=your@upiid
```

### Add More Food Items
Edit `scripts/seed.js` and add to `seedFoods` array:
```javascript
{
  name: 'Pizza',
  price: 150,
  image: 'https://images.unsplash.com/photo-xxx',
  isAvailable: true,
  stock: 30
}
```

Then run: `node scripts/seed.js`

---

## 🎨 Customization

### Change Colors
Edit `tailwind.config.js`:
```javascript
colors: {
  primary: '#F97316',    // Main orange color
  secondary: '#FB923C',  // Secondary orange
}
```

### Change Site Title
Edit `app/layout.js`:
```javascript
export const metadata = {
  title: 'Your Event Name',
  description: 'Your description',
}
```

---

## 🐛 Troubleshooting

### Port 3000 already in use
```bash
# Kill process on port 3000 (Windows)
npx kill-port 3000

# Or use different port
npm run dev -- -p 3001
```

### MongoDB connection failed
- Make sure MongoDB is running
- Check MONGODB_URI in .env.local
- Try using MongoDB Atlas (free cloud MongoDB)

### Images not loading
- Check internet connection (images from Unsplash)
- Update image URLs in scripts/seed.js

---

## 📦 Production Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Go to https://vercel.com
3. Import your GitHub repository
4. Add environment variables:
   - MONGODB_URI
   - ADMIN_PASSWORD
   - UPI_ID
   - NEXT_PUBLIC_UPI_ID
5. Deploy!

Your site will be live at: `your-project.vercel.app`

---

## 🎓 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [UPI Deep Linking](https://www.npci.org.in/what-we-do/upi/upi-link-specification)

---

**Need Help?** Check README.md for detailed documentation!
