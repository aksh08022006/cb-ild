# CB-ILD Developer Quick Reference

## 🚀 Start Here (Pick One)

### Option 1: Docker (Recommended - 5 minutes)
```bash
cd /Users/akshkaushik/Downloads/cb-ild
bash quick-start.sh   # Select option 1
# Wait 2 minutes
# Open http://localhost:4200
```

### Option 2: Manual Setup
```bash
# Terminal 1: Backend
cd backend && mvn spring-boot:run

# Terminal 2: Frontend  
cd frontend && npm start
```

---

## 📍 Service Endpoints

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://localhost:4200 | Angular UI |
| **Backend API** | http://localhost:8080/api | REST endpoints |
| **Swagger Docs** | http://localhost:8080/swagger-ui.html | API documentation |
| **Health Check** | http://localhost:8080/api/health | Backend status |
| **Database** | localhost:3306 | MySQL connection |

---

## 🔐 Login Credentials

```
Username: admin
Password: admin123
```

Other users: `kyc_officer` / `kyc123`, `analyst` / `analyst123`, `compliance` / `comply123`

---

## 📱 Main Modules

| Module | Route | Purpose |
|--------|-------|---------|
| KYC Completeness | /kyc-completeness | Score data quality |
| Submission Dashboard | /submissions | Track reporting cycles |
| Bureau Monitor | /bureau-monitor | Validation feedback |
| Data Insights | /data-insights | Inquiry logs & alerts |
| Dispute Resolution | /disputes | Case management |

---

## 🔧 Common Commands

### Docker
```bash
docker-compose up --build      # Start all services
docker-compose down            # Stop all services
docker-compose logs -f         # Watch logs
docker ps                      # List containers
docker logs cbild-backend -f   # Backend logs
```

### Backend (Maven)
```bash
mvn clean install              # Build project
mvn spring-boot:run            # Run locally
mvn test                       # Run tests
mvn clean                      # Clean build files
```

### Frontend (Angular)
```bash
npm install                    # Install dependencies
npm start                      # Start dev server
npm run build                  # Production build
npm test                       # Run tests
npm run lint                   # Lint code
```

### Database (MySQL)
```bash
# Connect
mysql -h localhost -u cbild_user -p cbild_pass cbild_db

# Inside MySQL:
SHOW TABLES;                   # List tables
SELECT * FROM users;           # View users
SELECT COUNT(*) FROM clients;  # Count clients
DESCRIBE clients;              # Show table structure
```

---

## 📡 API Quick Examples

### Authentication
```bash
# Get token
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | jq -r '.token')

echo "Token: $TOKEN"
```

### API Calls (with token)
```bash
# Get clients
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/clients | jq

# Get KYC score for client 1
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/kyc/1/score | jq

# Get submissions
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/submissions | jq

# Get disputes
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/disputes | jq

# Get health
curl http://localhost:8080/api/health | jq
```

---

## 🗂️ Key Files

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Full stack deployment |
| `backend/pom.xml` | Backend dependencies |
| `frontend/package.json` | Frontend dependencies |
| `backend/src/main/resources/application.yml` | Backend config |
| `backend/src/main/resources/db/migration/V1__initial_schema.sql` | Database schema |
| `backend/src/main/resources/db/migration/V2__seed_data.sql` | Sample data |
| `backend/src/main/java/org/mifos/cbild/CbIldApplication.java` | Backend entry point |
| `frontend/src/main.ts` | Frontend entry point |

---

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 8080 in use | `lsof -i :8080 && kill -9 <PID>` |
| Port 4200 in use | `lsof -i :4200 && kill -9 <PID>` |
| MySQL connection error | `mysql -h 127.0.0.1 -u cbild_user -p cbild_pass -e "SELECT 1;"` |
| Frontend won't load | Clear cache: `cd frontend && rm -rf node_modules && npm install && npm start` |
| Backend won't start | Check logs: `docker logs cbild-backend` |
| CORS error | Verify proxy.conf.json points to http://localhost:8080 |
| Can't login | Verify user exists: `mysql -u cbild_user -p cbild_pass cbild_db -e "SELECT * FROM users;"` |

**More issues?** See [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

---

## 📊 Database Quick Reference

### Tables
```sql
users              -- Auth users (admin, kyc_officer, etc.)
clients            -- Borrower/customer records
kyc_fields         -- KYC data fields
kyc_field_entities -- KYC field values
submissions        -- Bureau submissions
bureau_feedback    -- Bureau validation feedback
disputes           -- Dispute cases
audit_log          -- System audit trail
inquiry_log        -- Credit inquiries
alerts             -- System alerts
```

### Common Queries
```sql
-- List all users
SELECT username, role FROM users;

-- Count clients
SELECT COUNT(*) FROM clients;

-- Get submissions for client
SELECT * FROM submissions WHERE client_id = 1;

-- View audit log
SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 10;

-- Check KYC scores
SELECT * FROM kyc_fields WHERE client_id = 1;
```

---

## 🔍 Verify Setup is Working

```bash
# All commands should succeed:

# 1. Docker running
docker ps | grep cbild

# 2. MySQL responding
mysql -u cbild_user -p cbild_pass cbild_db -e "SELECT 1;"

# 3. Backend responding
curl http://localhost:8080/api/health

# 4. Frontend responding
curl http://localhost:4200 | head

# 5. User exists
mysql -u cbild_user -p cbild_pass cbild_db -e "SELECT username FROM users LIMIT 1;"
```

---

## 📚 Documentation Links

- **Full Setup Guide** → [SETUP_GUIDE.md](SETUP_GUIDE.md)
- **Verification Checklist** → [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md)
- **Troubleshooting** → [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- **Project Overview** → [README.md](README.md)
- **Getting Started** → [GETTING_STARTED.md](GETTING_STARTED.md)

---

## 💾 Working Directory

```bash
# Quick access
PROJECT_HOME="/Users/akshkaushik/Downloads/cb-ild"
cd "$PROJECT_HOME"

# Backend
cd backend

# Frontend
cd frontend

# Database migrations
cat backend/src/main/resources/db/migration/*.sql
```

---

## 🎯 Development Workflow

1. **Start services**
   ```bash
   bash quick-start.sh  # Pick option 1 or 2
   ```

2. **Verify health**
   ```bash
   curl http://localhost:8080/api/health
   curl http://localhost:4200
   ```

3. **Open in browser**
   - Frontend: http://localhost:4200
   - Swagger: http://localhost:8080/swagger-ui.html

4. **Make changes**
   - Backend: Edit Java files, changes auto-reload (if using mvn spring-boot:run)
   - Frontend: Edit TypeScript/HTML, auto-refreshes via ng serve

5. **Test changes**
   - Backend: Use Swagger UI or cURL
   - Frontend: Use browser DevTools

6. **Check logs**
   - Backend: `docker logs cbild-backend -f` or terminal output
   - Frontend: Browser Console (F12)
   - Database: MySQL client queries

---

## 🚀 Performance Tips

```bash
# Faster Maven builds
mvn install -DskipTests -q

# Faster npm install
npm ci  # Instead of npm install

# Docker prune (free space)
docker system prune -a --volumes

# Kill all Docker containers
docker kill $(docker ps -q)

# Full Docker reset
docker-compose down -v
docker system prune -a --volumes
docker-compose up --build
```

---

## 🔑 Key Configuration Values

```
JWT_SECRET: mifos-cbild-gsoc2026-secret-key-aksh08022006
JWT_EXPIRATION: 86400000 (24 hours)
MYSQL_USER: cbild_user
MYSQL_PASSWORD: cbild_pass
MYSQL_DATABASE: cbild_db
SERVER_PORT: 8080 (backend)
CLIENT_PORT: 4200 (frontend)
DB_PORT: 3306 (mysql)
```

---

## 📞 Quick Help

**Stuck?** Try:
1. Read the issue in [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
2. Check logs: `docker logs cbild-backend`
3. Restart services: `docker-compose restart`
4. Full reset: `docker-compose down -v && docker-compose up --build`

---

**Last Updated**: March 20, 2026  
**Project**: CB-ILD (Mifos Credit Bureau Information Lifecycle Dashboard)  
**Print this page or bookmark it for quick reference!**
