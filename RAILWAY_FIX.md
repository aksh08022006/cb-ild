# CB-ILD Railway Deployment Fix

## Why It's Failing

Railway no longer auto-deploys Docker Compose files. The error "Error creating build plan with Railpack" means Railway couldn't find a buildpack to use.

## ✅ SOLUTION: Deploy Individual Services

Railway works best with individual services, not docker-compose. Here's the fix:

---

## Step 1: Create Services on Railway

### Step 1a: Deploy MySQL Database
1. Go to [railway.app](https://railway.app)
2. Create new project
3. Click "Add Service" → "Provision MySQL"
4. Wait for MySQL to start (about 1 minute)

### Step 1b: Deploy Backend (Spring Boot)

1. Click "Add Service" → "Deploy from GitHub"
2. Select `cb-ild` repository
3. In the Service Details:
   - **Root Directory:** `backend`
   - **Dockerfile Path:** `Dockerfile`

4. Add Environment Variables:
   ```
   SPRING_DATASOURCE_URL=mysql://<DATABASE_HOST>:3306/cbild_db
   SPRING_DATASOURCE_USERNAME=root
   SPRING_DATASOURCE_PASSWORD=<DATABASE_PASSWORD>
   JWT_SECRET=mifos-cbild-gsoc2026-secret-key
   SPRING_JPA_HIBERNATE_DDL_AUTO=validate
   ```

5. Click "Deploy"

### Step 1c: Deploy Frontend (Angular/Nginx)

1. Click "Add Service" → "Deploy from GitHub"
2. Select `cb-ild` repository
3. In the Service Details:
   - **Root Directory:** `frontend`
   - **Dockerfile Path:** `Dockerfile`

4. No environment variables needed for frontend
5. Click "Deploy"

---

## Step 2: Connect Services

Railway will auto-generate URLs:
- MySQL: `<mysql-host>:<mysql-port>`
- Backend: `<backend-url>.railway.app`
- Frontend: `<frontend-url>.railway.app`

The services can communicate using Railway's internal networking.

---

## Step 3: Update Database Connection

For the backend service, Railway provides the MySQL connection details. Update your environment variables with:

```
SPRING_DATASOURCE_URL=mysql://mysql-service-name:3306/cbild_db?useSSL=false&allowPublicKeyRetrieval=true
```

---

## Alternative: Use Render.com Instead (Easier)

Railway's docker-compose support is limited. **Render.com is actually easier:**

### Render.com Steps:
1. Go to [render.com](https://render.com)
2. Click "New" → "Blueprint"
3. Select your GitHub repo
4. Render auto-detects docker-compose.yml
5. Click "Create"
6. Wait 10-15 minutes
7. Get live URL

**This is the recommended approach** - Render has better docker-compose support.

---

## Quick Fix: Local Docker Testing

Before deploying, test locally:

```bash
cd /Users/akshkaushik/Downloads/cb-ild
docker-compose up --build
```

Visit: `http://localhost:4200`

This confirms everything works before cloud deployment.

---

## Recommended Deployment Path

1. ✅ Test locally with docker-compose
2. ✅ Push to GitHub
3. ✅ Deploy to **Render.com** (best for docker-compose)
   - OR deploy to Railway with individual services

---

## Need Help?

**For Render (Recommended):**
- Go to render.com
- New Blueprint from GitHub
- Select cb-ild repo
- Render handles everything

**For Railway:**
- Add services individually (MySQL, Backend, Frontend)
- Configure environment variables
- Connect them in Railway dashboard

---

## What NOT to Do

❌ Don't try to deploy docker-compose.yml directly to Railway
✅ Do deploy individual services to Railway
✅ Do use Render.com for docker-compose (much easier)

---

## Status Check

After deployment:
1. Visit frontend URL
2. Login with: `admin / admin123`
3. Should see dashboard
4. All modules should work

If you see errors, check:
- Database connectivity
- Environment variables
- Service logs in Railway/Render dashboard
