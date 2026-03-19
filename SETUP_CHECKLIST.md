# CB-ILD Setup Checklist & Testing Guide

## 📋 Pre-Setup Verification

### System Requirements
- [ ] macOS (or Linux/Windows with Docker)
- [ ] Internet connection (for downloading dependencies)
- [ ] At least 4GB RAM available
- [ ] At least 5GB free disk space

### Software Prerequisites

#### Option A: Docker Setup (Easiest)
- [ ] Docker Desktop installed (`docker --version`)
- [ ] Docker Compose available (`docker-compose --version`)

#### Option B: Manual Setup (Local Development)
- [ ] Java 17+ installed
  ```bash
  java -version  # Should show java 17+
  ```

- [ ] Maven 3.9+ installed
  ```bash
  mvn -version   # Should show maven 3.9+
  ```

- [ ] Node 18+ installed
  ```bash
  node -v        # Should show v18+
  npm -v         # Should show npm 9+
  ```

- [ ] Angular CLI 17 installed
  ```bash
  ng version     # Should show angular 17+
  ```

- [ ] MySQL 8.0 running and accessible
  ```bash
  mysql -u root -e "SELECT 1;"
  ```

---

## 🚀 Setup Execution

### Quick Start (Recommended)
```bash
cd /Users/akshkaushik/Downloads/cb-ild
bash quick-start.sh
```

**Follow the interactive prompts and select option 1 (Docker)** for fastest setup.

---

## ✅ Post-Setup Verification

### 1. Docker Setup Verification (if using Docker)

```bash
# Check all containers are running
docker ps | grep cbild

# Expected output: 3 containers (mysql, backend, frontend)
```

- [ ] MySQL container running (`cbild-mysql`)
- [ ] Backend container running (`cbild-backend`)
- [ ] Frontend container running (`cbild-frontend`)

### 2. Database Verification

```bash
# Access MySQL from host
mysql -h 127.0.0.1 -u cbild_user -p cbild_pass cbild_db

# Inside MySQL client, run:
SHOW TABLES;
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM clients;
```

**Expected tables** (in any order):
- [ ] `users`
- [ ] `clients`
- [ ] `kyc_fields`
- [ ] `kyc_field_entities`
- [ ] `submissions`
- [ ] `bureau_feedback`
- [ ] `disputes`
- [ ] `audit_log`
- [ ] `inquiry_log`
- [ ] `alerts`

**Expected seed data**:
- [ ] At least 1 user (admin)
- [ ] At least 5 clients (sample data)

### 3. Backend API Verification

#### Health Check
```bash
curl -s http://localhost:8080/api/health | jq
```

**Expected response**:
```json
{
  "status": "UP"
}
```

#### Swagger UI Check
- [ ] Open http://localhost:8080/swagger-ui.html in browser
- [ ] Should see "Credit Bureau Information Lifecycle Dashboard"
- [ ] Should list all endpoints in expandable format

#### Sample API Calls

```bash
# Get all clients
curl -s http://localhost:8080/api/clients \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" | jq

# Get KYC endpoints
curl -s http://localhost:8080/api/swagger-ui.html \
  | grep -i kyc
```

### 4. Frontend Verification

#### Manual Check
- [ ] Open http://localhost:4200 in browser
- [ ] Should see login page
- [ ] Page title shows "CB-ILD - Mifos"

#### Login Test
```
Username: admin
Password: admin123
```

- [ ] Login button is clickable
- [ ] Login redirects to dashboard
- [ ] Dashboard loads without errors (check Console - F12)

#### Dashboard Module Verification
After logging in, check sidebar has:
- [ ] KYC Completeness
- [ ] Submission Dashboard
- [ ] Bureau Monitor
- [ ] Data Insights
- [ ] Dispute Resolution

### 5. Browser Console Verification
- [ ] Open DevTools (F12)
- [ ] Go to Console tab
- [ ] **Should have 0 errors** (some warnings are OK)
- [ ] No 404 errors for API calls
- [ ] No CORS errors

### 6. API Integration Test
In browser console, test API connection:
```javascript
fetch('http://localhost:8080/api/health')
  .then(r => r.json())
  .then(d => console.log('✓ Backend connected:', d))
  .catch(e => console.error('✗ Backend error:', e))
```

Expected: `✓ Backend connected: {status: "UP"}`

---

## 🔐 User Authentication Testing

Test each user role:

| Role | Username | Password | Expected |
|------|----------|----------|----------|
| Admin | `admin` | `admin123` | Full access to all modules |
| KYC Officer | `kyc_officer` | `kyc123` | Access to KYC modules |
| Credit Analyst | `analyst` | `analyst123` | Access to submission & insights |
| Compliance | `compliance` | `comply123` | Access to disputes & audit |

### Authentication Test
```bash
# Get JWT token
curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | jq

# Expected: { "token": "eyJ0eXAiOiJKV1QiLCJhbGc..." }
```

---

## 📊 Functional Testing

### Module 1: KYC Completeness
- [ ] Click "KYC Completeness" in sidebar
- [ ] Should display KYC scoring dashboard
- [ ] Should show list of clients
- [ ] Should show completeness percentage for each client

### Module 2: Submission Dashboard
- [ ] Click "Submission Dashboard"
- [ ] Should show submission history
- [ ] Should have submission status indicators
- [ ] Should show Metro 2® mapping info

### Module 3: Bureau Monitor
- [ ] Click "Bureau Monitor"
- [ ] Should show bureau feedback data
- [ ] Should show match confidence scores
- [ ] Should display validation results

### Module 4: Data Insights
- [ ] Click "Data Insights"
- [ ] Should show inquiry logs
- [ ] Should display score drop alerts
- [ ] Should show delinquency alerts

### Module 5: Dispute Resolution
- [ ] Click "Dispute Resolution"
- [ ] Should list open disputes
- [ ] Should show dispute details
- [ ] Should have resolution workflow

---

## 🐛 Troubleshooting Checklist

### Issue: Containers Not Starting
```bash
# Check Docker logs
docker logs cbild-mysql
docker logs cbild-backend
docker logs cbild-frontend

# Restart containers
docker-compose restart
```

- [ ] All containers start without errors
- [ ] Check disk space: `df -h`
- [ ] Check Docker logs for specific errors

### Issue: Port Already in Use
```bash
# Check what's using port 8080
lsof -i :8080

# Check what's using port 4200
lsof -i :4200

# Check what's using port 3306
lsof -i :3306

# Kill process (use PID from above)
kill -9 <PID>
```

### Issue: Database Connection Error
```bash
# Verify MySQL is accessible
mysql -h 127.0.0.1 -u cbild_user -p cbild_pass -e "SELECT 1;"

# Check Docker container logs
docker logs cbild-mysql

# Try to restart MySQL
docker-compose restart mysql
```

### Issue: Frontend Not Loading
```bash
# Check if port 4200 is accessible
curl http://localhost:4200

# Clear npm cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

### Issue: API Calls Failing
```bash
# Check backend logs
docker logs cbild-backend -f

# Test API directly
curl -v http://localhost:8080/api/health

# Check CORS configuration in browser console
# (Open DevTools F12, Network tab, check response headers)
```

---

## 📈 Performance Baseline

After successful setup, note these metrics:

```
Frontend Load Time: _____ ms (should be < 3s)
Backend Response Time: _____ ms (should be < 500ms)
Database Query Time: _____ ms (should be < 100ms)
Number of Console Errors: _____ (should be 0)
```

---

## 🔧 Configuration Files Reference

### Backend Configuration
- **File**: [backend/src/main/resources/application.yml](backend/src/main/resources/application.yml)
- **Key settings**:
  - Database URL, username, password
  - JWT secret and expiration
  - Flyway migration settings
  - Logging levels

### Frontend Configuration
- **File**: [frontend/proxy.conf.json](frontend/proxy.conf.json)
- **Key settings**:
  - Backend API proxy target
  - CORS settings

### Docker Configuration
- **File**: [docker-compose.yml](docker-compose.yml)
- **Key settings**:
  - Port mappings
  - Environment variables
  - Volume persistence

---

## 📚 Next Steps After Setup

1. **Explore the API**
   - Open http://localhost:8080/swagger-ui.html
   - Try each endpoint with the Swagger UI
   - Download the OpenAPI JSON

2. **Review Database Schema**
   ```bash
   mysql -u cbild_user -p cbild_pass cbild_db
   DESCRIBE clients;
   DESCRIBE kyc_fields;
   DESCRIBE submissions;
   ```

3. **Study the Code**
   - Start with [backend/src/main/java/org/mifos/cbild/CbIldApplication.java](backend/src/main/java/org/mifos/cbild/CbIldApplication.java)
   - Review [backend/src/main/java/org/mifos/cbild/service/KycScoringService.java](backend/src/main/java/org/mifos/cbild/service/KycScoringService.java)
   - Check [frontend/src/app/app.routes.ts](frontend/src/app/app.routes.ts)

4. **Test with Sample Data**
   - Use the seed data from [backend/src/main/resources/db/migration/V2__seed_data.sql](backend/src/main/resources/db/migration/V2__seed_data.sql)
   - Create test cases using the sample client IDs

5. **Set Up Version Control** (if not already done)
   ```bash
   git init
   git add .
   git commit -m "Initial commit: CB-ILD GSoC 2026"
   git remote add origin https://github.com/aksh08022006/cb-ild.git
   git branch -M main
   git push -u origin main
   ```

---

## 🎯 Success Criteria

Your setup is **complete and working** when:

✅ All 3 Docker containers are running
✅ Database has seed data (users, clients)
✅ Backend API responds to health check
✅ Frontend loads and redirects to login
✅ Can log in with admin credentials
✅ Dashboard shows all 5 modules
✅ Browser console has 0 errors
✅ API Swagger UI is accessible

---

## 💡 Tips & Best Practices

1. **Logs are your friend**
   ```bash
   # Watch backend logs in real-time
   docker logs cbild-backend -f
   
   # Watch frontend logs
   npm start 2>&1 | grep -v "^$"
   ```

2. **Database Management**
   ```bash
   # Backup database
   mysqldump -u cbild_user -p cbild_pass cbild_db > backup.sql
   
   # Reset database
   docker-compose down -v
   docker-compose up --build -d
   ```

3. **Development Workflow**
   - Keep `docker logs cbild-backend -f` in one terminal
   - Keep `npm start` in another terminal
   - Keep `mysql -u cbild_user -p cbild_pass cbild_db` connection ready

4. **Performance Optimization**
   - Clear Docker images: `docker system prune`
   - Clean Maven cache: `mvn clean`
   - Clear npm cache: `npm cache clean --force`

---

**Last Updated**: March 20, 2026
**Project**: CB-ILD (Mifos Credit Bureau Information Lifecycle Dashboard)
**Status**: Ready for GSOC 2026 Submission
