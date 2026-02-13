# Firebase Setup Guide

This project now uses Firebase Firestore instead of MongoDB. Follow these steps to set up Firebase for your application.

## Prerequisites

- A Google account
- Node.js installed on your machine

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project" or "Create a Project"
3. Enter your project name (e.g., "foodfest-2026")
4. Follow the setup wizard (you can disable Google Analytics if not needed)
5. Click "Create Project"

## Step 2: Enable Firestore Database

1. In your Firebase project console, click on "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" for development (you can change security rules later)
4. Select a location for your database (choose the closest to your users)
5. Click "Enable"

## Step 3: Get Service Account Credentials

1. In the Firebase Console, click on the gear icon (⚙️) next to "Project Overview"
2. Select "Project settings"
3. Go to the "Service accounts" tab
4. Click "Generate new private key"
5. Click "Generate key" - this will download a JSON file

## Step 4: Configure Environment Variables

1. Open the downloaded JSON file
2. Copy the values to your `.env.local` file:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (keep the quotes and newlines)

Example `.env.local`:
```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...(your private key)...==\n-----END PRIVATE KEY-----\n"
ADMIN_PASSWORD=admin123
UPI_ID=your-upi-id@bank
NEXT_PUBLIC_UPI_ID=your-upi-id@bank
NODE_ENV=development
```

⚠️ **Important**: Never commit your `.env.local` file to version control!

## Step 5: Install Dependencies

```bash
npm install
```

This will install the new Firebase dependencies:
- `firebase`: Firebase SDK
- `firebase-admin`: Firebase Admin SDK for server-side operations

## Step 6: Seed the Database

Run the seed script to populate initial food items:

```bash
npm run seed
```

You should see output like:
```
🌱 Initializing Firebase...
✅ Connected to Firebase
🗑️  Cleared existing food items
✅ Seed data inserted successfully!

📋 Current food items:
   - Chicken Pakoda: ₹50
   - Paneer Pakoda: ₹50

✨ Database seeding completed!
```

## Step 7: Start the Application

```bash
npm run dev
```

Your application should now be running with Firebase Firestore!

## Firestore Collections

The application uses two main collections:

### `foods` Collection
Stores food items with the following fields:
- `name`: string
- `price`: number
- `image`: string
- `isAvailable`: boolean
- `createdAt`: ISO date string
- `updatedAt`: ISO date string

### `orders` Collection
Stores orders with the following fields:
- `orderId`: string (e.g., "FF-001")
- `customerName`: string
- `phone`: string (optional)
- `items`: array of objects
  - `foodId`: string (reference to food document)
  - `foodName`: string
  - `quantity`: number
  - `price`: number
- `totalAmount`: number
- `paymentStatus`: string (pending, paid, rejected, pending_verification)
- `orderStatus`: string (placed, accepted, completed)
- `utrNumber`: string (optional)
- `createdAt`: ISO date string
- `updatedAt`: ISO date string

## Security Rules (Production)

For production, update your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Foods collection - read for all, write for authenticated admins only
    match /foods/{foodId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Orders collection - read/write with restrictions
    match /orders/{orderId} {
      allow read: if true;
      allow create: if true;
      allow update: if request.auth != null;
      allow delete: if request.auth != null;
    }
  }
}
```

## Migration Notes

### Key Changes from MongoDB:

1. **No Models**: Firebase doesn't use schemas like Mongoose. Data is stored directly in collections.

2. **Document IDs**: 
   - MongoDB uses `_id` 
   - Firebase uses auto-generated IDs or custom IDs via `.doc(id)`
   - Access via `doc.id` property

3. **Queries**:
   - MongoDB: `Model.find({}).sort({ createdAt: 1 })`
   - Firebase: `collection('foods').orderBy('createdAt', 'asc').get()`

4. **Updates**:
   - MongoDB: `doc.save()` or `Model.updateOne()`
   - Firebase: `docRef.update({ field: value })`

5. **References**:
   - MongoDB: `populate()` for references
   - Firebase: Manual lookup or subcollections (we use manual lookups)

6. **Timestamps**:
   - MongoDB: Automatic with `timestamps: true`
   - Firebase: Manual via `createdAt` and `updatedAt` fields

## Troubleshooting

### "FIREBASE_PROJECT_ID is not defined"
Make sure your `.env.local` file exists and contains all required Firebase variables.

### "Permission denied" errors
Check your Firestore security rules and ensure they allow the operations you're trying to perform.

### Private key formatting issues
Ensure the private key in `.env.local` is wrapped in quotes and includes `\n` for newlines.

### Connection issues
Verify that:
- Your Firebase project is active
- Firestore is enabled
- Your service account credentials are correct

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
