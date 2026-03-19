# ✅ Run CB-ILD Locally - Complete Guide

Get your app running on your machine in **5 minutes**.

---

## 📋 What You Need

- **Docker** installed on your machine
- **Docker Desktop** (includes docker-compose)
- Terminal/Command prompt
- ~2GB free disk space

### Check If You Have Docker

```bash
docker --version
docker-compose --version
```

If these work, you're ready! ✅

---

## 🚀 Start the Application

### Step 1: Navigate to Project

```bash
cd /Users/akshkaushik/Downloads/cb-ild
```

### Step 2: Start All Services

```bash
docker-compose up --build
```

**What happens:**
- Downloads MySQL, Java, Node.js images
- Builds backend (Spring Boot)
- Builds frontend (Angular)
- Starts 3 services automatically
- Takes 2-5 minutes first time ⏳

**Wait for this message:**
```
[backend] Started CbIldApplication
[frontend] nginx: master process started
[mysql] Ready for connections
```

---

## 🌐 Access Your App

Once everything is running, open your browser:

```
http://localhost:4200
```

You should see the **beautiful CB-ILD login page** ✨

---

## 🔓 Login Credentials

### Admin Account
```
Username: admin
Password: admin123
```

### Other Test Accounts
```
KYC Officer:   kyc_officer / kyc123
Analyst:       analyst / analyst123
Compliance:    compliance / comply123
```

---

## 🎯 What You Can Do

✅ **Login** with admin credentials
✅ **View Dashboard** - See metrics and activity
✅ **Explore Modules:**
  - KYC Completeness
  - Submission Dashboard
  - Bureau Monitor
  - Data Insights
  - Dispute Resolution
✅ **Test all features**
✅ **See the professional UI**

---

## 📊 What's Running

```
Frontend:  http://localhost:4200       (Angular + Nginx)
Backend:   http://localhost:8080/api   (Spring Boot)
Database:  localhost:3306              (MySQL)
API Docs:  http://localhost:8080/swagger-ui.html
```

---

## 🛑 Stop the Application

When you're done testing:

```bash
# Press Ctrl+C in the terminal
# OR in a new terminal:

docker-compose down
```

To completely clean up:

```bash
docker-compose down -v
```

---

## 🧪 Test the Full Workflow

### 1. Login
- Username: `admin`
- Password: `admin123`

### 2. View Dashboard
- See KYC completion percentage
- Check active submissions
- View recent activity

### 3. Explore KYC Module
- Click "KYC Completeness" in sidebar
- See field-by-field completion status
- View bureau readiness score

### 4. Check Submission Dashboard
- View submission history
- See status of each submission

### 5. Try Other Modules
- Bureau Monitor
- Data Insights
- Dispute Resolution

---

## 🐛 Troubleshooting

### "Port already in use"
```bash
# Kill process on port 4200
lsof -ti:4200 | xargs kill -9

# Kill process on port 8080
lsof -ti:8080 | xargs kill -9

# Kill process on port 3306
lsof -ti:3306 | xargs kill -9

# Try again
docker-compose up --build
```

### "Docker daemon not running"
- Open Docker Desktop app
- Wait for it to fully start
- Try command again

### "Cannot connect to backend"
- Check backend logs: `docker-compose logs backend`
- Give it 30 seconds to fully start
- Check port 8080 is not blocked

### "Database connection error"
- Make sure MySQL container started
- Check logs: `docker-compose logs mysql`
- Verify credentials in `application.yml`

### "Frontend shows blank page"
- Wait 2-3 minutes for Angular build
- Check logs: `docker-compose logs frontend`
- Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)

---

## 📝 Project Structure (For Reference)

```
cb-ild/
├── backend/                 # Spring Boot 3.2
│   ├── src/
│   ├── pom.xml
│   └── Dockerfile
├── frontend/                # Angular 17
│   ├── src/
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml       # Orchestration
└── [other files]
```

---

## 🎓 Useful Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql
```

### Check Service Status
```bash
docker-compose ps
```

### Rebuild Everything
```bash
docker-compose down
docker-compose up --build
```

### Access Database
```bash
docker-compose exec mysql mysql -u cbild_user -p cbild_db
# Password: cbild_pass
```

---

## 💡 Development Tips

If you want to modify code while running:

1. **Backend changes:** Restart backend container
   ```bash
   docker-compose restart backend
   ```

2. **Frontend changes:** Auto-reloads (ng serve watches files)

3. **Database changes:** Migrations run automatically on startup

---

## 🎉 You're All Set!

Your CB-ILD app is running locally with:
- ✅ Professional glassmorphic UI
- ✅ Full backend API
- ✅ MySQL database with seed data
- ✅ All 5 modules working
- ✅ Authentication & authorization
- ✅ Complete feature set

---

## 📸 For GSOC Submission

Since you have the app running locally:
1. **Take screenshots** of the UI
2. **Record a video demo** (30 seconds - 2 minutes)
3. **Show the features working**
4. **Include in your GSOC proposal**

GSOC evaluators will be impressed by:
- ✅ Working application
- ✅ Professional UI design
- ✅ Clean code in GitHub
- ✅ Comprehensive documentation
- ✅ Video/screenshot proof of functionality

---

## 🚀 Next: GSOC Submission

Include in your proposal:
1. **GitHub URL:** `https://github.com/aksh08022006/cb-ild`
2. **Screenshots/Video:** Of app working locally
3. **Features:** List all implemented modules
4. **Tech Stack:** Spring Boot, Angular, MySQL, Docker
5. **How to Run:** Point to this guide

---

## ✨ Summary

Run this to see your app working:
```bash
cd /Users/akshkaushik/Downloads/cb-ild
docker-compose up --build
```

Then visit: **http://localhost:4200**

Login: **admin / admin123**

That's it! Your complete GSOC proof of work is running! 🎊
