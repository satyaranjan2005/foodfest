# 🚀 Deployment Guide

## Option 1: Vercel (Recommended - Easiest) ⭐

Vercel is made by the creators of Next.js and offers the best experience.

### Steps:

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - FoodFest 2026"
   git branch -M main
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Sign up on Vercel**
   - Go to https://vercel.com
   - Sign up with GitHub account

3. **Import Project**
   - Click "New Project"
   - Import your GitHub repository
   - Vercel auto-detects Next.js

4. **Add Environment Variables**
   Click "Environment Variables" and add:
   ```
   MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/foodfest
   ADMIN_PASSWORD = your_secure_password
   UPI_ID = your@upi
   NEXT_PUBLIC_UPI_ID = your@upi
   NODE_ENV = production
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your site will be live at `your-project.vercel.app`

6. **Seed Production Database**
   - Update `scripts/seed.js` to use production MongoDB URI
   - Run locally: `node scripts/seed.js`
   - Or create a temporary API route to seed from browser

### Custom Domain (Optional)
- Go to Project Settings → Domains
- Add your custom domain
- Update DNS records as instructed

---

## Option 2: Railway

Railway offers free tier with auto-deploy from GitHub.

### Steps:

1. **Push to GitHub** (same as Vercel)

2. **Sign up on Railway**
   - Go to https://railway.app
   - Sign up with GitHub

3. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

4. **Add MongoDB**
   - Click "New" → "Database" → "Add MongoDB"
   - Railway will create a MongoDB instance
   - Copy the connection string

5. **Add Environment Variables**
   - Click on your service → "Variables"
   - Add all env variables
   - Use Railway's MongoDB connection string

6. **Deploy**
   - Railway auto-deploys on git push
   - Get your URL from the deployment

---

## Option 3: Netlify

### Steps:

1. **Build for Static Export** (modify next.config.js):
   ```javascript
   const nextConfig = {
     output: 'export',
     // ... rest of config
   }
   ```

2. **Push to GitHub**

3. **Deploy on Netlify**
   - Go to https://netlify.com
   - Import from GitHub
   - Build command: `npm run build`
   - Publish directory: `out`

4. **Add Environment Variables** in Netlify dashboard

**Note**: Static export has limitations with API routes. Not recommended for this project.

---

## Option 4: DigitalOcean App Platform

### Steps:

1. **Push to GitHub**

2. **Create DigitalOcean Account**
   - Go to https://digitalocean.com

3. **Create New App**
   - Apps → Create App
   - Connect GitHub
   - Select repository

4. **Configure Build**
   - Build command: `npm run build`
   - Run command: `npm start`

5. **Add Environment Variables**
   - Add all env variables in App Settings

6. **Add MongoDB**
   - Create managed MongoDB cluster
   - Or use MongoDB Atlas

7. **Deploy**

Cost: ~$5/month for basic app

---

## Option 5: Self-Hosted (VPS)

For AWS EC2, Azure VM, or any VPS:

### Prerequisites:
- Ubuntu 20.04+ or similar
- Node.js 18+
- MongoDB
- Nginx (for reverse proxy)
- PM2 (for process management)

### Steps:

1. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Install MongoDB**
   ```bash
   sudo apt update
   sudo apt install -y mongodb
   sudo systemctl start mongodb
   sudo systemctl enable mongodb
   ```

3. **Install PM2**
   ```bash
   sudo npm install -g pm2
   ```

4. **Clone & Setup Project**
   ```bash
   git clone YOUR_REPO_URL
   cd foodfest-2026
   npm install
   ```

5. **Create .env.local**
   ```bash
   nano .env.local
   # Add all environment variables
   ```

6. **Build Project**
   ```bash
   npm run build
   ```

7. **Seed Database**
   ```bash
   npm run seed
   ```

8. **Start with PM2**
   ```bash
   pm2 start npm --name "foodfest" -- start
   pm2 save
   pm2 startup
   ```

9. **Configure Nginx**
   ```bash
   sudo nano /etc/nginx/sites-available/foodfest
   ```
   
   Add:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   Enable site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/foodfest /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

10. **Setup SSL (Optional but Recommended)**
    ```bash
    sudo apt install certbot python3-certbot-nginx
    sudo certbot --nginx -d your-domain.com
    ```

---

## MongoDB Options

### Option A: MongoDB Atlas (Recommended)
- Go to https://cloud.mongodb.com
- Create free cluster (512MB free)
- Get connection string
- Use in MONGODB_URI

### Option B: Local MongoDB
- Only for development
- Not recommended for production

### Option C: Managed MongoDB
- MongoDB Atlas
- AWS DocumentDB
- Azure Cosmos DB

---

## Environment Variables Checklist

Before deploying, ensure you have:

- [ ] `MONGODB_URI` - MongoDB connection string
- [ ] `ADMIN_PASSWORD` - Secure admin password
- [ ] `UPI_ID` - Your UPI ID for payments
- [ ] `NEXT_PUBLIC_UPI_ID` - Same UPI ID (public)
- [ ] `NODE_ENV` - Set to `production`

---

## Post-Deployment Steps

1. **Test User Flow**
   - Visit homepage
   - Add items to cart
   - Complete checkout
   - Submit UTR

2. **Test Admin Flow**
   - Login to admin panel
   - Verify payment
   - Accept order
   - Mark complete

3. **Seed Database**
   - Run seed script with production URI
   - Or create temporary API route

4. **Monitor**
   - Check error logs
   - Monitor database connections
   - Test on mobile devices

5. **Optimize**
   - Enable caching
   - Compress images
   - Monitor performance

---

## Troubleshooting

### Build Fails
- Check all dependencies installed
- Verify environment variables
- Check for syntax errors

### Database Connection Fails
- Verify MongoDB URI
- Check IP whitelist (MongoDB Atlas)
- Ensure MongoDB is running

### 502 Bad Gateway (Nginx)
- Check if app is running: `pm2 status`
- Check app logs: `pm2 logs foodfest`
- Restart: `pm2 restart foodfest`

### Images Not Loading
- Check Image domains in next.config.js
- Verify internet connection
- Check browser console for errors

---

## Production Best Practices

1. **Security**
   - Change default admin password
   - Enable HTTPS/SSL
   - Use strong MongoDB password
   - Implement rate limiting

2. **Performance**
   - Enable CDN
   - Compress images
   - Enable caching
   - Use production build

3. **Monitoring**
   - Setup error tracking (Sentry)
   - Monitor server resources
   - Check database performance
   - Track API response times

4. **Backup**
   - Regular database backups
   - Code version control
   - Document configuration

---

## Support

- Next.js Docs: https://nextjs.org/docs
- Vercel Docs: https://vercel.com/docs
- MongoDB Atlas: https://docs.atlas.mongodb.com

---

**Recommended**: Start with Vercel (free tier) + MongoDB Atlas (free tier) for production deployment. It's the easiest and most reliable option! 🚀
