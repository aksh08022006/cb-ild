# ✅ Deploy CB-ILD to Vercel (Frontend) + Railway (Backend) - Step by Step

Complete guide to get your app live in 15 minutes, **no credit card needed**.

---

## 📋 Overview

```
Frontend (Angular) → Vercel ✅
         ↓ (API calls)
Backend (Java/Spring Boot) → Railway ✅
         ↓
Database → Railway PostgreSQL ✅
```

---

## ⏱️ Timeline
- Step 1-2: Railway setup - 5 minutes
- Step 3: Backend deploy - 8 minutes (auto-builds)
- Step 4-5: Vercel setup - 2 minutes
- **Total: 15 minutes**

---

# STEP 1: Create Railway Account

1. Go to **[railway.app](https://railway.app)**
2. Click **"Start Free"**
3. Sign up with **GitHub** (free, no card needed)
4. Authorize railway.app to access your repos
5. ✅ Done!

---

# STEP 2: Create PostgreSQL Database on Railway

1. Go to **[dashboard.railway.app](https://dashboard.railway.app)**
2. Click **"+ New"** (top right)
3. Select **"Database"** → **"PostgreSQL"**
4. Click **"Create"**
5. **Wait 2 minutes** for it to start

### Save These Details (you'll need them):
When the database starts, click on it and you'll see:
- **PGHOST** (hostname)
- **PGPORT** (usually 5432)
- **PGUSER** (username)
- **PGPASSWORD** (password)
- **PGDATABASE** (database name)

Copy these somewhere safe! ✅

---

# STEP 3: Deploy Backend to Railway

### 3a. Create Backend Service

1. Go back to **[dashboard.railway.app](https://dashboard.railway.app)**
2. Click **"+ New"** → **"GitHub Repo"**
3. **Search and select**: `cb-ild`
4. Click **"Deploy Now"**

### 3b. Configure Backend

1. Once the service appears, click on it
2. Go to **"Settings"** tab
3. Find **"Root Directory"**
4. Set it to: `backend`
5. Click **"Save"**

### 3c. Add Environment Variables

1. In the same service, click **"Variables"** tab
2. Add these variables (copy from your PostgreSQL database above):

```
SPRING_DATASOURCE_URL=jdbc:postgresql://[PGHOST]:[PGPORT]/[PGDATABASE]?sslmode=require
SPRING_DATASOURCE_USERNAME=[PGUSER]
SPRING_DATASOURCE_PASSWORD=[PGPASSWORD]
SPRING_JPA_HIBERNATE_DDL_AUTO=update
SPRING_JPA_DATABASE_PLATFORM=org.hibernate.dialect.PostgreSQLDialect
JWT_SECRET=mifos-cbild-gsoc2026-secret-key
```

Replace `[PGHOST]`, `[PGPORT]`, `[PGDATABASE]`, `[PGUSER]`, `[PGPASSWORD]` with actual values from Step 2!

3. Click **"Deploy"** or Railway auto-deploys
4. **Wait 5-10 minutes** for build to complete

### 3d. Get Backend URL

1. In Railway dashboard, find your backend service
2. Click it
3. Go to **"Settings"** → look for **"Service URL"** or **"Public URL"**
4. Copy the URL (looks like `https://cbild-backend-xxx.railway.app`)
5. **Save this URL** - you need it for frontend! ✅

---

# STEP 4: Prepare Frontend for Vercel

### 4a. Update Backend API URL

Before deploying to Vercel, update the frontend to use the Railway backend URL:

1. Open: `frontend/src/app/shared/services/api.services.ts`
2. Find the line that says:
   ```typescript
   private apiUrl = 'http://localhost:8080/api';
   ```
3. Change it to:
   ```typescript
   private apiUrl = 'https://[YOUR-RAILWAY-BACKEND-URL]/api';
   ```
4. Replace `[YOUR-RAILWAY-BACKEND-URL]` with the URL from Step 3d
5. **Save the file**

### 4b. Commit and Push

```bash
cd /Users/akshkaushik/Downloads/cb-ild
git add frontend/src/app/shared/services/api.services.ts
git commit -m "config: Update backend URL for Vercel deployment"
git push origin main
```

---

# STEP 5: Deploy Frontend to Vercel

### 5a. Create Vercel Account

1. Go to **[vercel.com](https://vercel.com)**
2. Click **"Sign Up"**
3. Select **"Continue with GitHub"**
4. Authorize Vercel
5. ✅ Done!

### 5b. Deploy CB-ILD

1. In Vercel dashboard, click **"Add New..."** → **"Project"**
2. **Import** → Select `cb-ild` repository
3. **Framework**: Select **"Angular"**
4. **Root Directory**: `frontend`
5. Click **"Deploy"**

### 5c. Wait for Build

- Vercel auto-builds (5-10 minutes)
- You'll see build logs
- When done, you get a **live URL** ✅

---

# ✅ YOU'RE LIVE!

You now have:
- ✅ **Frontend URL** (from Vercel) - This is your live app!
- ✅ **Backend running** (on Railway)
- ✅ **Database connected** (PostgreSQL on Railway)

---

# 🧪 TEST YOUR APP

1. **Open the Vercel frontend URL in your browser**
2. **You should see the CB-ILD login page** ✨
3. **Login with**: 
   ```
   Username: admin
   Password: admin123
   ```
4. **Explore the dashboard**
5. **Try the modules** (KYC, Submissions, etc.)

---

# 🚨 Troubleshooting

### Frontend shows blank page or errors
**Problem**: Can't connect to backend
**Fix**: 
- Check backend URL in `api.services.ts` is correct
- Verify Railway backend is running (check Railway dashboard)
- Backend might still be building (wait 5-10 min)

### Login fails or database errors
**Problem**: Backend can't connect to database
**Fix**:
- Check environment variables in Railway
- Verify database credentials are correct
- Check PostgreSQL is running in Railway

### Backend won't build
**Problem**: Build failed on Railway
**Fix**:
- Check build logs in Railway dashboard
- Verify `pom.xml` has PostgreSQL driver (should be fixed already)
- Try redeploying from Railway dashboard

### CORS errors
**Problem**: Frontend can't call backend API
**Fix**:
- Railway backend URL might be wrong
- Re-check `api.services.ts` has correct URL
- Ensure URL has `/api` suffix

---

# 📊 What You Just Did

✅ **Connected GitHub** to Railway and Vercel
✅ **Deployed PostgreSQL database** on Railway (free tier)
✅ **Deployed Java backend** to Railway (auto-builds from GitHub)
✅ **Deployed Angular frontend** to Vercel (auto-builds from GitHub)
✅ **Configured backend URL** in frontend
✅ **Created live demo** with working app

**Total deployment: 15 minutes** ⏱️

---

# 🎯 Next Steps

1. **Share the Vercel URL** in your GSOC proposal
2. **Show the live app** working to evaluators
3. **Mention both Vercel and Railway** in your submission
4. **Link to GitHub repo** for code review

---

# 💡 Pro Tips

- Free tier services **can take 30 seconds to wake up** (cold start)
- First visit might be slow, subsequent visits are fast
- You can upgrade anytime if you add features
- All data stays in PostgreSQL (free tier has limits)

---

## 🎉 DONE! You're live! 🚀

Your CB-ILD app is now accessible to anyone with the Vercel URL!

For GSOC submission, use:
- **Live App URL**: `https://[your-vercel-url].vercel.app`
- **GitHub Repo**: `https://github.com/aksh08022006/cb-ild`
- **Backend**: Running on Railway (explain in submission)

Good luck with your GSOC proposal! 🌟
