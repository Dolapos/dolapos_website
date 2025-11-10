# Railway Deployment Guide

Complete guide to deploying your portfolio website to Railway with PostgreSQL and AWS S3.

---

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- ✅ Completed AWS S3 setup (see `AWS_S3_SETUP.md`)
- ✅ AWS Access Key ID and Secret Access Key
- ✅ S3 bucket name and region
- ✅ GitHub account (for deploying from repository)
- ✅ Railway account (free tier available)

---

## 🎯 Architecture Overview

```
┌─────────────────────────┐
│   Frontend (React)      │
│   Deploy to: Vercel     │ ← We'll cover this at the end
│   or Netlify            │
└───────────┬─────────────┘
            │
            │ API Calls (https://your-backend.railway.app/api)
            │
┌───────────▼─────────────┐
│   Backend (Express)     │
│   Deploy to: Railway    │ ← Start here
└───┬───────────────┬─────┘
    │               │
    ▼               ▼
┌────────┐    ┌─────────┐
│PostgreSQL│    │  AWS S3 │
│(Railway) │    │ (Videos)│
└──────────┘    └─────────┘
```

---

## 🚂 Part 1: Deploy Backend to Railway

### Step 1: Create Railway Account

1. Go to https://railway.app/
2. Click **"Login"** → Sign up with GitHub
3. Authorize Railway to access your GitHub account
4. Complete the signup process

**Free Tier Includes:**
- $5 free credit per month
- 500 hours of runtime
- Perfect for portfolio projects!

---

### Step 2: Create New Project

1. Click **"New Project"** from Railway dashboard
2. Select **"Deploy from GitHub repo"**
3. Click **"Configure GitHub App"** (if first time)
4. Give Railway access to your repository
5. Select your `dolapos_website` repository
6. Railway will detect it's a Node.js project

---

### Step 3: Add PostgreSQL Database

1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"Add PostgreSQL"**
3. Railway will:
   - Create a PostgreSQL database
   - Generate `DATABASE_URL` automatically
   - Link it to your backend service

**Note**: The `DATABASE_URL` will be automatically available to your backend as an environment variable!

---

### Step 4: Configure Environment Variables

1. Click on your **backend service** (not the database)
2. Go to **"Variables"** tab
3. Click **"+ New Variable"** and add these:

```env
# Node Environment
NODE_ENV=production

# Server will use Railway's PORT
# (Railway automatically provides $PORT)

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-to-something-random

# CORS - Your frontend URL (add later after deploying frontend)
FRONTEND_URL=https://your-frontend-url.vercel.app

# Storage Configuration
STORAGE_TYPE=s3

# AWS S3 Credentials (from AWS_S3_SETUP.md)
AWS_ACCESS_KEY_ID=AKIA...your-key...
AWS_SECRET_ACCESS_KEY=wJalr...your-secret...
S3_BUCKET_NAME=dolapo-portfolio-videos
S3_REGION=us-east-1

# Database - Railway provides this automatically
# DATABASE_URL=${{Postgres.DATABASE_URL}}
```

**Important Notes:**
- `DATABASE_URL` is automatically set by Railway when you add PostgreSQL
- `PORT` is automatically set by Railway (don't set it manually)
- Generate a strong random JWT secret (use https://randomkeygen.com/)

---

### Step 5: Configure Build Settings (Optional)

Railway should auto-detect your setup, but verify:

1. Click on your backend service
2. Go to **"Settings"** tab
3. Check **"Build"** section:
   - **Build Command**: (leave empty, Railway will use `npm install`)
   - **Start Command**: Should be `npm start` or `node server.js`

If not set, Railway will read from your `Procfile` (which we created).

---

### Step 6: Initial Deployment

1. Railway will automatically deploy on the first push
2. Wait for deployment to complete (watch the logs)
3. You'll see logs like:
   ```
   Installing dependencies...
   Running npm install...
   Starting application...
   Connected to PostgreSQL database
   Server running on port 1234
   ```

**If deployment fails**, check the logs for errors!

---

### Step 7: Initialize Database with Admin Account

After successful deployment, you need to create an admin account:

#### Method A: Using Railway Shell (Recommended)

1. In Railway dashboard, click your backend service
2. Click **"Shell"** tab (or Settings → Terminal)
3. A terminal will open in your deployed container
4. Run the initialization script:
   ```bash
   npm run init-db-postgres
   ```
5. Follow the prompts to create admin account
6. **SAVE THE CREDENTIALS** shown (especially the secret path!)

#### Method B: Using Railway CLI (Advanced)

If you have Railway CLI installed locally:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Run the script
railway run npm run init-db-postgres
```

---

### Step 8: Get Your Backend URL

1. In Railway dashboard, click your backend service
2. Go to **"Settings"** → **"Domains"**
3. Railway will show a generated URL like:
   ```
   https://your-backend-production-abc123.up.railway.app
   ```
4. **Copy this URL** - you'll need it for:
   - Frontend configuration
   - Testing API endpoints

**Optional: Custom Domain**
- Click **"Generate Domain"** to get a cleaner Railway subdomain
- Or add your own custom domain (requires DNS configuration)

---

### Step 9: Test Your Backend

Test your deployed API:

```bash
# Health check
curl https://your-backend.railway.app/

# Test videos endpoint
curl https://your-backend.railway.app/api/videos

# Test admin login (replace with your secret path)
curl https://your-backend.railway.app/your-secret-path/admin/login
```

**Expected responses:**
- Root (`/`): Should return welcome message or 404
- `/api/videos`: Should return empty array `[]` (no videos yet)
- `/your-secret-path/admin/login`: Should return login form or 200 OK

---

## 🎨 Part 2: Deploy Frontend (React)

Your frontend needs to be deployed separately. **Recommended platforms**: Vercel or Netlify.

### Option A: Deploy to Vercel (Recommended)

#### Step 1: Create Vercel Account

1. Go to https://vercel.com/
2. Sign up with GitHub
3. Authorize Vercel

#### Step 2: Import Project

1. Click **"Add New Project"**
2. Import your `dolapos_website` repository
3. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

#### Step 3: Add Environment Variable

Before deploying, add environment variable:

1. Go to **"Environment Variables"** section
2. Add variable:
   ```
   Name:  VITE_API_URL
   Value: https://your-backend.railway.app/api
   ```
   (Use your Railway backend URL from Part 1, Step 8)

3. Click **"Deploy"**

#### Step 4: Get Frontend URL

After deployment completes:
1. Vercel will give you a URL like: `https://your-project.vercel.app`
2. **Copy this URL**

#### Step 5: Update Backend CORS

1. Go back to Railway dashboard
2. Click your backend service → **"Variables"**
3. Update the `FRONTEND_URL` variable:
   ```
   FRONTEND_URL=https://your-project.vercel.app
   ```
4. Railway will automatically redeploy with new CORS settings

---

### Option B: Deploy to Netlify

#### Step 1: Create Netlify Account

1. Go to https://netlify.com/
2. Sign up with GitHub
3. Authorize Netlify

#### Step 2: Import Project

1. Click **"Add new site"** → **"Import an existing project"**
2. Connect to GitHub
3. Select your `dolapos_website` repository
4. Configure build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`

#### Step 3: Add Environment Variable

1. Go to **"Site settings"** → **"Environment variables"**
2. Add variable:
   ```
   Key:   VITE_API_URL
   Value: https://your-backend.railway.app/api
   ```

3. Click **"Deploy site"**

#### Step 4: Update Backend CORS

Same as Vercel Option A, Step 5.

---

## 🎬 Part 3: Upload Your First Video

Now that everything is deployed, let's test by uploading a video!

### Step 1: Access Admin Panel

1. Go to: `https://your-frontend.vercel.app/your-secret-path/admin/login`
   - Replace `your-secret-path` with the secret path from database initialization
2. Login with your admin credentials

### Step 2: Upload Video

1. Click **"Upload Video"** or similar button
2. Fill in video details:
   - Title
   - Description
   - Category
3. Select video file from your computer
4. Click **"Upload"**

**What happens:**
- Video is uploaded to Railway backend
- Backend uploads video to S3
- Metadata is saved in PostgreSQL
- You can now view it on your portfolio!

### Step 3: View on Homepage

1. Go to your frontend URL: `https://your-frontend.vercel.app`
2. Your video should appear in the portfolio!

---

## 🔧 Part 4: Ongoing Deployment (CI/CD)

Both Railway and Vercel/Netlify support **automatic deployments**:

### Automatic Deployments

**When you push to GitHub:**
1. Railway automatically redeploys backend
2. Vercel/Netlify automatically redeploys frontend

**To deploy changes:**

```bash
# Make your changes locally
git add .
git commit -m "Add new feature"
git push origin main

# Railway and Vercel will automatically deploy!
```

**Note**: Both platforms redeploy on every push to the main branch.

---

## 📊 Part 5: Monitoring & Maintenance

### Railway Monitoring

1. **View Logs**: Railway dashboard → Backend service → **"Logs"** tab
2. **Metrics**: See CPU, memory, network usage
3. **Usage**: Track your $5/month free credits

### PostgreSQL Management

**View database:**

#### Method 1: Railway Dashboard
1. Click PostgreSQL service
2. Go to **"Data"** tab
3. View tables and records

#### Method 2: Database Client (Advanced)
1. Copy `DATABASE_URL` from Railway
2. Use tools like:
   - pgAdmin (https://www.pgadmin.org/)
   - TablePlus (https://tableplus.com/)
   - DBeaver (https://dbeaver.io/)

**Example connection**:
```
postgresql://user:pass@host.railway.app:5432/railway
```

---

## 🐛 Troubleshooting

### Videos not uploading?

**Check:**
1. S3 credentials are correct in Railway environment variables
2. S3 bucket CORS is configured properly
3. Railway logs show S3 connection errors

**Fix:**
- Verify AWS credentials
- Check S3 bucket permissions
- Review backend logs

---

### Frontend can't connect to backend?

**Check:**
1. `VITE_API_URL` is set correctly in Vercel/Netlify
2. Backend `FRONTEND_URL` includes your frontend domain
3. Backend is running (check Railway logs)

**Fix:**
- Redeploy frontend with correct `VITE_API_URL`
- Update `FRONTEND_URL` in Railway
- Check CORS configuration

---

### Database connection errors?

**Check:**
1. PostgreSQL service is running in Railway
2. `DATABASE_URL` is set automatically by Railway
3. Schema is initialized (run `npm run init-db-postgres`)

**Fix:**
- Restart PostgreSQL service
- Verify database is not sleeping (free tier)
- Check connection string format

---

### "Out of credits" on Railway?

**Railway free tier**: $5/month

**If you run out:**
1. Upgrade to hobby plan ($5/month)
2. Optimize your app (reduce memory/CPU usage)
3. Use Railway's sleep/wake features for non-critical services

---

## 🚀 Performance Optimization

### 1. Enable CDN for Frontend

**Vercel** automatically includes CDN.

**Netlify** automatically includes CDN.

### 2. S3 CloudFront (Optional)

For better video performance:

1. Create CloudFront distribution in AWS
2. Point it to your S3 bucket
3. Update backend to use CloudFront URLs instead of S3 URLs

**Benefits:**
- Faster video loading worldwide
- Reduced S3 costs
- Better user experience

### 3. Database Indexing

Your database already has indexes on:
- `videos.category`
- `videos.is_featured`
- `videos.created_at`

These speed up queries!

---

## 🔒 Security Best Practices

### 1. Environment Variables

**Never commit:**
- `.env` files
- AWS credentials
- Database passwords
- JWT secrets

**Always use:**
- Railway environment variables for production
- Vercel/Netlify environment variables for frontend

### 2. JWT Secret

**Generate strong JWT secret:**

```bash
# Linux/Mac
openssl rand -base64 32

# Or use website
https://randomkeygen.com/
```

### 3. Database Security

**Railway PostgreSQL is secure by default:**
- Not publicly accessible
- SSL/TLS encryption
- Isolated network

### 4. S3 Security

**Configure S3 bucket policy:**
- Enable versioning (optional)
- Set up lifecycle rules to delete old files
- Monitor access logs

---

## 💰 Cost Estimates

### Monthly Costs (Approximate)

| Service | Free Tier | After Free Tier |
|---------|-----------|-----------------|
| **Railway** | $5 credit/month | $0.000463/GB-hour |
| **Vercel** | 100 GB bandwidth | $20/month hobby |
| **Netlify** | 100 GB bandwidth | $19/month pro |
| **S3 Storage** | 5 GB free (12 months) | $0.023/GB/month |
| **S3 Requests** | 20K GET, 2K PUT | $0.0004 per 1K GET |

**Example portfolio with 20 videos (5GB) and 1,000 views/month:**
- Railway: **Free** (within $5 credit)
- Vercel: **Free** (within 100GB bandwidth)
- S3: **$0.12/month** (after free tier)

**Total: ~$0-5/month** for most portfolio websites!

---

## 📚 Additional Resources

### Railway Documentation
- https://docs.railway.app/
- https://docs.railway.app/databases/postgresql

### Vercel Documentation
- https://vercel.com/docs
- https://vitejs.dev/guide/env-and-mode.html

### AWS S3 Documentation
- https://docs.aws.amazon.com/s3/
- https://docs.aws.amazon.com/AmazonS3/latest/userguide/cors.html

---

## ✅ Deployment Checklist

Use this checklist to verify everything is set up correctly:

### Backend (Railway)
- ✅ Railway project created
- ✅ PostgreSQL database added
- ✅ Environment variables configured (JWT_SECRET, AWS credentials, etc.)
- ✅ Backend deployed successfully
- ✅ Database initialized with admin account
- ✅ Backend URL obtained

### Frontend (Vercel/Netlify)
- ✅ Frontend deployed
- ✅ `VITE_API_URL` environment variable set
- ✅ Frontend URL obtained
- ✅ Backend CORS updated with frontend URL

### AWS S3
- ✅ S3 bucket created
- ✅ CORS configured
- ✅ IAM user created with permissions
- ✅ Access keys added to Railway

### Testing
- ✅ Admin login works
- ✅ Video upload works
- ✅ Videos display on frontend
- ✅ Video playback works

---

## 🎉 Success!

If you've completed all steps, your portfolio is now live and accessible to the world!

**Share your work:**
- `https://your-portfolio.vercel.app` - Your live portfolio
- Test uploading videos through admin panel
- Share the URL with potential clients and employers!

---

## 🆘 Need Help?

**If you encounter issues:**

1. **Check the logs**
   - Railway: Backend service → Logs tab
   - Vercel: Deployment → Function logs
   - Browser: Developer Console (F12)

2. **Common issues covered in Troubleshooting section above**

3. **Railway Support**
   - Discord: https://discord.gg/railway
   - Docs: https://docs.railway.app/

4. **AWS Support**
   - AWS Forums: https://forums.aws.amazon.com/

---

**Good luck with your deployment! 🚀**
