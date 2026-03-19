# ✅ CB-ILD Render Deployment - Simple Manual Approach

The docker-compose blueprint keeps failing. **Solution: Deploy services manually on Render** (still very easy, just click-based).

## Why Manual is Actually Easier

Render's blueprints have issues with complex docker-compose files. Deploying 3 services manually takes **5 minutes** and is more reliable.

---

## Step 1: Delete Failed Deployment

1. Go to [render.com dashboard](https://dashboard.render.com)
2. Find `cb-ild` web service
3. Click "Settings" → Scroll down → "Delete Service"
4. Confirm deletion

---

## Step 2: Deploy MySQL Database (1 minute)

1. Go to [render.com](https://render.com)
2. Click "New +" → "Database"
3. Select "MySQL"
4. **Configuration:**
   - Name: `cb-ild-mysql`
   - Database: `cbild_db`
   - Username: `cbild_user`
   - Password: `cbild_pass`
5. Click "Create Database"
6. **Save the connection info** - you'll need it for the backend

---

## Step 3: Deploy Backend Service (2 minutes)

1. Click "New +" → "Web Service"
2. **Connect GitHub:**
   - Select "cb-ild" repo
   - Branch: `main`
   - Build Command: `mvn clean package -DskipTests`
   - Start Command: `java -jar target/*.jar`
3. **Environment Variables:**
   ```
   SPRING_DATASOURCE_URL=mysql://[DB_HOST]:[DB_PORT]/cbild_db?useSSL=false&allowPublicKeyRetrieval=true
   SPRING_DATASOURCE_USERNAME=cbild_user
   SPRING_DATASOURCE_PASSWORD=cbild_pass
   JWT_SECRET=mifos-cbild-gsoc2026-secret-key
   ```
   
   *Replace [DB_HOST] and [DB_PORT] with values from Step 2*

4. **Root Directory:** `backend`
5. Click "Create Web Service"
6. **Wait for build** (5-10 minutes)

---

## Step 4: Deploy Frontend Service (2 minutes)

1. Click "New +" → "Web Service"
2. **Connect GitHub:**
   - Select "cb-ild" repo
   - Branch: `main`
   - Build Command: `npm ci && npm run build`
   - Start Command: `npx http-server dist/cb-ild-frontend -p 3000`
3. **Root Directory:** `frontend`
4. **No environment variables needed**
5. Click "Create Web Service"
6. **Wait for build** (3-5 minutes)

---

## Step 5: Connect Services

The services can now communicate:
- Frontend → Backend: Use backend's Render URL
- Backend → MySQL: Render provides internal networking automatically

---

## Done! 🎉

You'll get 3 URLs:
- **Frontend:** `https://[something].onrender.com` ← This is your live app!
- **Backend:** `https://[something].onrender.com`
- **MySQL:** Internal only

---

## Login Details

Use these credentials:
```
Admin:       admin / admin123
KYC Officer: kyc_officer / kyc123
Analyst:     analyst / analyst123
Compliance:  compliance / comply123
```

---

## Troubleshooting

### Frontend shows "Cannot get /" or blank page
- Check: Did backend build successfully?
- Check: Are environment variables correct?
- Solution: Restart frontend service

### Backend shows "Connection refused" or database error
- Check: Is MySQL service running?
- Check: Are database credentials correct?
- Check: DATASOURCE_URL has correct host:port
- Solution: Copy the exact connection details from MySQL service

### Services say "Exited with status 1"
- Click "View logs" to see error
- 99% of the time it's missing environment variables
- Add missing vars and restart

---

## Total Estimated Time

- Step 1 (Delete): 1 minute
- Step 2 (MySQL): 2 minutes
- Step 3 (Backend build): 10 minutes ⏳
- Step 4 (Frontend build): 5 minutes ⏳
- **Total: ~18 minutes**

---

## After Deployment

Test your live app:
1. Visit frontend URL
2. Login with `admin / admin123`
3. Navigate to Dashboard
4. Try each module

Everything should work! 🚀

---

## Need Help?

Check [Render status page](https://status.render.com) if services are down
Contact: support@render.com or check Render docs

---

**This manual approach is actually MORE reliable than blueprints for complex apps!**
