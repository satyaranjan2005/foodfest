# 🚀 Vercel Deployment Guide for Firebase

## ⚠️ Important: Setting Environment Variables in Vercel

The build errors you're experiencing are because Firebase credentials aren't configured in Vercel. Follow these steps:

## Step 1: Add Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Click **"Settings"** → **"Environment Variables"**
3. Add these variables:

### Required Variables:

| Variable Name | Value | Notes |
|---------------|-------|-------|
| `FIREBASE_PROJECT_ID` | `foodfest-26299` | Your Firebase project ID |
| `FIREBASE_CLIENT_EMAIL` | `firebase-adminsdk-xxxxx@foodfest-26299.iam.gserviceaccount.com` | From your service account JSON |
| `FIREBASE_PRIVATE_KEY` | Full private key with `\n` | **See important note below** |
| `ADMIN_PASSWORD` | `admin123` | Your admin password |
| `UPI_ID` | `satyaranjannayak2005@oksbi` | Your UPI ID |
| `NEXT_PUBLIC_UPI_ID` | `satyaranjannayak2005@oksbi` | Public UPI ID |
| `NODE_ENV` | `production` | Environment mode |

### ⚠️ FIREBASE_PRIVATE_KEY Format

This is the **most critical** part. The private key must be formatted correctly:

**Step 1**: Get your private key from the Firebase service account JSON file. It looks like:
```json
"private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...(very long)...==\n-----END PRIVATE KEY-----\n"
```

**Step 2**: Copy the **entire value INCLUDING the quotes**, for example:
```
"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...(full key)...==\n-----END PRIVATE KEY-----\n"
```

**Step 3**: In Vercel, paste it **WITH the quotes** - the value in Vercel should look exactly like:
```
"-----BEGIN PRIVATE KEY-----\nMIIE...==\n-----END PRIVATE KEY-----\n"
```

Do NOT:
- ❌ Remove the quotes
- ❌ Remove the `\n` characters
- ❌ Add extra line breaks
- ❌ Modify the key in any way

### Alternative Method (If Still Getting Errors)

If you're still getting the decoder error, try using base64 encoding:

1. **Encode your private key**:
   - On Windows PowerShell:
   ```powershell
   $key = Get-Content service-account-key.json | ConvertFrom-Json | Select-Object -ExpandProperty private_key
   [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($key))
   ```

2. **In Vercel**, add as `FIREBASE_PRIVATE_KEY_BASE64` and update `lib/db.js`:
   ```javascript
   privateKey: process.env.FIREBASE_PRIVATE_KEY 
     ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
     : Buffer.from(process.env.FIREBASE_PRIVATE_KEY_BASE64, 'base64').toString('utf-8')
   ```

## Step 2: Set Environment Variable Scope

For each variable, make sure to select:
- ✅ **Production**
- ✅ **Preview** (recommended)
- ✅ **Development** (optional)

## Step 3: Redeploy

After adding all environment variables:

1. Go to **"Deployments"** tab
2. Click the **three dots (•••)** on the latest deployment
3. Select **"Redeploy"**
4. ✅ Check **"Use existing Build Cache"** (optional)
5. Click **"Redeploy"**

Or simply push a new commit:
```bash
git add .
git commit -m "Fix: Add dynamic routes configuration"
git push origin main
```

## Step 4: Verify Deployment

Once deployment completes, check:
- ✅ Build logs show "✅ Firebase Admin initialized successfully"
- ✅ No "DECODER routines::unsupported" errors
- ✅ Pages load correctly

## Common Issues & Solutions

### Issue 1: "error:1E08010C:DECODER routines::unsupported"
**Solution**: Private key format is incorrect. Make sure:
- Quotes are included
- `\n` characters are preserved
- No extra line breaks added

### Issue 2: "Dynamic server usage" error
**Solution**: Already fixed! Routes now have `export const dynamic = 'force-dynamic'`

### Issue 3: "Missing suspense boundary"
**Solution**: Already fixed! Order success page now uses Suspense

### Issue 4: Can't find service account JSON
**Solution**: 
1. Go to Firebase Console → Project Settings
2. Service Accounts tab
3. Click "Generate new private key"
4. Save and use that JSON file

## Firestore Security Rules

Don't forget to update your Firestore rules for production:

1. Go to Firebase Console → Firestore Database
2. Click **"Rules"** tab
3. Update to:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /foods/{foodId} {
      allow read: if true;
      allow write: if false; // Only server can write
    }
    
    match /orders/{orderId} {
      allow read: if true;
      allow create: if true;
      allow update: if false; // Only server can update
      allow delete: if false;
    }
  }
}
```

## Testing After Deployment

1. **Homepage**: Should load with food items
2. **Admin Login**: `/admin` - Test with your password
3. **Place Order**: Test the complete order flow
4. **Admin Dashboard**: Verify orders appear

## Need Help?

If you're still having issues:
1. Check Vercel deployment logs
2. Verify all environment variables are set correctly
3. Make sure Firebase project has Firestore enabled
4. Check Firebase quotas and billing

Happy deploying! 🚀
