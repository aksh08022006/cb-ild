# CB-ILD: Complete Setup & Deployment Guide

## 🎯 Executive Summary

**CB-ILD** (Credit Bureau Information Lifecycle Dashboard) is a full-stack GSOC 2026 proof of work project for **Mifos WebApp** that provides:

- Complete UI and API layer for credit data management
- 5 integrated modules for KYC, submissions, bureau feedback, insights, and dispute resolution
- Modern tech stack: Spring Boot 3.2 (Java 17), Angular 17, MySQL 8.0
- Production-ready Docker deployment
- Full API documentation with Swagger/OpenAPI
- JWT-based role-based access control

**Status**: ✅ Ready for deployment and testing

---

## 📂 Documentation Structure

You now have **4 complete guides** in this project:

### 1. **SETUP_GUIDE.md** - Quick Start & Installation
   - **Use this when**: You're setting up for the first time
   - **Contains**: 
     - Docker quick start (5 minutes)
     - Manual setup instructions
     - Verification steps
     - Troubleshooting links

### 2. **SETUP_CHECKLIST.md** - Comprehensive Verification
   - **Use this when**: You want to verify the setup is complete
   - **Contains**:
     - Pre-setup verification checklist
     - Post-setup verification steps
     - Functional testing guide
     - Performance baseline metrics

### 3. **TROUBLESHOOTING.md** - Problem Solving
   - **Use this when**: Something isn't working
   - **Contains**:
     - 30+ common issues with solutions
     - Quick reference commands
     - Network diagnostics
     - Configuration troubleshooting

### 4. **README.md** - Project Overview
   - **Use this when**: You need project context
   - **Contains**:
     - Architecture diagram
     - Module descriptions
     - API reference
     - Database schema
     - Contributing guidelines

---

## 🚀 Quick Start (Choose Your Path)

### Path A: Fastest Setup (Docker - Recommended)
```bash
cd /Users/akshkaushik/Downloads/cb-ild
bash quick-start.sh
# Select option 1 (Docker)
# Wait 2 minutes
# Open http://localhost:4200
```

**Time**: ~5 minutes | **Requirements**: Docker only

### Path B: Development Setup (Local)
```bash
cd /Users/akshkaushik/Downloads/cb-ild
bash quick-start.sh
# Select option 2 (Manual)
# Run backend and frontend in separate terminals
```

**Time**: ~10 minutes | **Requirements**: Java, Maven, Node, MySQL

### Path C: Backend Only
```bash
cd /Users/akshkaushik/Downloads/cb-ild/backend
mvn clean install -DskipTests
mvn spring-boot:run
# Backend runs on http://localhost:8080
```

### Path D: Frontend Only
```bash
cd /Users/akshkaushik/Downloads/cb-ild/frontend
npm install
npm start
# Frontend runs on http://localhost:4200
```

---

## ✅ Success Verification (5-Minute Test)

After following any path above, verify everything works:

```bash
# Test 1: Check all services running
docker ps | grep cbild  # (if using Docker)

# Test 2: Database is healthy
mysql -u cbild_user -p cbild_pass cbild_db -e "SELECT COUNT(*) FROM users;"
# Expected: Should return a number > 0

# Test 3: Backend responds
curl http://localhost:8080/api/health
# Expected: {"status":"UP"}

# Test 4: Frontend loads
curl http://localhost:4200 | head -5
# Expected: Should return HTML

# Test 5: Login works
# Open http://localhost:4200
# Username: admin
# Password: admin123
# Should see dashboard with 5 modules
```

---

## 📊 Project Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Angular 17 Frontend                   │
│                (http://localhost:4200)                  │
│  - KYC Completeness                                     │
│  - Submission Dashboard                                 │
│  - Bureau Monitor                                       │
│  - Data Insights                                        │
│  - Dispute Resolution                                   │
└──────────────────────┬──────────────────────────────────┘
                       │ REST API / JSON
┌──────────────────────▼──────────────────────────────────┐
│            Spring Boot 3.2 Backend (Java 17)            │
│             (http://localhost:8080/api)                 │
│  - KycController, SubmissionController, etc.            │
│  - KycScoringService, AuditService, etc.                │
│  - JWT Authentication & Role-Based Access Control      │
│  - Swagger UI at /swagger-ui.html                       │
└──────────────────────┬──────────────────────────────────┘
                       │ JPA/Hibernate
┌──────────────────────▼──────────────────────────────────┐
│                  MySQL 8.0 Database                     │
│          (localhost:3306, user: cbild_user)             │
│  - users, clients, kyc_fields, submissions              │
│  - bureau_feedback, disputes, audit_log, etc.           │
│  - Flyway version control for migrations                │
└─────────────────────────────────────────────────────────┘
```

---

## 🔐 Authentication

All endpoints require JWT authentication. Get a token with:

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

**Response**:
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "username": "admin",
  "role": "ADMIN"
}
```

**Use token in subsequent requests**:
```bash
curl -H "Authorization: Bearer <token>" http://localhost:8080/api/clients
```

---

## 👥 Default Users

| Username | Password | Role | Permissions |
|----------|----------|------|-------------|
| `admin` | `admin123` | ADMIN | All modules, all actions |
| `kyc_officer` | `kyc123` | KYC_OFFICER | KYC modules only |
| `analyst` | `analyst123` | ANALYST | Submission & insights |
| `compliance` | `comply123` | COMPLIANCE | Disputes & audit |

---

## 📚 API Examples

### Get All Clients
```bash
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | jq -r '.token')

curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/clients | jq
```

### Get KYC Score for a Client
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/kyc/1/score | jq
```

### Get Submissions
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/submissions | jq
```

### Get Disputes
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/disputes | jq
```

**View full API documentation**:
- Open http://localhost:8080/swagger-ui.html
- All endpoints are documented with examples

---

## 📁 Project Structure

```
cb-ild/
├── README.md                          # Project overview
├── SETUP_GUIDE.md                     # ← Start here!
├── SETUP_CHECKLIST.md                 # Verification guide
├── TROUBLESHOOTING.md                 # Problem solving
├── quick-start.sh                     # Automated setup script
├── docker-compose.yml                 # Full stack deployment
│
├── backend/                           # Spring Boot application
│   ├── src/main/java/org/mifos/cbild/
│   │   ├── CbIldApplication.java      # Entry point
│   │   ├── controller/                # REST endpoints
│   │   ├── service/                   # Business logic
│   │   ├── model/                     # JPA entities
│   │   ├── repository/                # Data access
│   │   ├── dto/                       # DTOs
│   │   ├── config/                    # Spring config
│   │   └── security/                  # JWT auth
│   ├── src/main/resources/
│   │   ├── application.yml            # Configuration
│   │   └── db/migration/              # Flyway migrations
│   ├── pom.xml                        # Maven dependencies
│   └── Dockerfile                     # Container image
│
├── frontend/                          # Angular application
│   ├── src/app/
│   │   ├── app.config.ts              # App configuration
│   │   ├── app.routes.ts              # Routing setup
│   │   ├── core/                      # Auth, guards, interceptors
│   │   ├── modules/                   # 5 feature modules
│   │   └── shared/                    # Shared services
│   ├── src/main.ts                    # Entry point
│   ├── package.json                   # NPM dependencies
│   ├── angular.json                   # Angular config
│   ├── proxy.conf.json                # API proxy
│   ├── Dockerfile                     # Container image
│   └── nginx.conf                     # Web server config
│
└── volumes/                           # Docker persistent storage
    └── mysql_data/                    # Database files
```

---

## 🛠️ Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | Angular | 17.3 |
| | TypeScript | 5.x |
| | Material Design | 17.3 |
| | Chart.js | 4.4 |
| | RxJS | 7.8 |
| **Backend** | Spring Boot | 3.2 |
| | Java | 17 |
| | Spring Security | 6.x |
| | Spring Data JPA | Latest |
| | JWT | jjwt 0.12 |
| **Database** | MySQL | 8.0 |
| | Flyway | (included) |
| **DevOps** | Docker | Latest |
| | Docker Compose | 3.8+ |
| **Documentation** | Swagger/OpenAPI | 3.0 |

---

## 📋 Setup Decision Tree

**Choose based on your situation:**

```
Do you have Docker installed?
├─ YES
│  └─ Run: bash quick-start.sh → Select option 1 ✅ (5 min)
│
└─ NO
   └─ Do you have Java, Maven, Node, MySQL installed?
      ├─ YES (All)
      │  └─ Run: bash quick-start.sh → Select option 2 ✅ (10 min)
      │
      ├─ PARTIAL
      │  ├─ Has Java + Maven?
      │  │  └─ Run: bash quick-start.sh → Select option 3
      │  │
      │  └─ Has Node?
      │     └─ Run: bash quick-start.sh → Select option 4
      │
      └─ NO (None)
         └─ Install Docker: https://www.docker.com
            └─ Then use option 1 ✅
```

---

## 🔍 Verification Checklist

After setup, verify each step:

- [ ] **MySQL Running**: `docker ps | grep mysql` or `mysql -u root -e "SELECT 1;"`
- [ ] **Backend Running**: `curl http://localhost:8080/api/health`
- [ ] **Frontend Running**: `curl http://localhost:4200`
- [ ] **Database Tables**: `mysql -u cbild_user -p cbild_pass cbild_db -e "SHOW TABLES;"`
- [ ] **Seed Data**: `mysql -u cbild_user -p cbild_pass cbild_db -e "SELECT COUNT(*) FROM users;"`
- [ ] **Swagger UI**: Open http://localhost:8080/swagger-ui.html
- [ ] **Frontend Login**: Open http://localhost:4200, login with admin/admin123
- [ ] **Dashboard Modules**: See all 5 modules in sidebar

---

## 🐛 Troubleshooting Quick Links

**Common Issues**:
- Port already in use → See TROUBLESHOOTING.md (Port sections)
- Cannot connect to MySQL → See TROUBLESHOOTING.md (Database)
- Backend won't start → See TROUBLESHOOTING.md (Backend)
- Frontend blank page → See TROUBLESHOOTING.md (Frontend)
- CORS errors → See TROUBLESHOOTING.md (CORS Errors)
- JWT not working → See TROUBLESHOOTING.md (JWT Token)

**For any other issue**: See [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

---

## 📞 Support & Resources

- **GitHub**: https://github.com/aksh08022006/cb-ild
- **Issues**: https://github.com/aksh08022006/cb-ild/issues
- **Mifos**: https://mifos.org
- **Spring Boot Docs**: https://spring.io/projects/spring-boot
- **Angular Docs**: https://angular.io/docs
- **MySQL Docs**: https://dev.mysql.com/doc/

---

## ✨ Next Steps After Setup

1. **Review the Code**
   - Start: `backend/src/main/java/org/mifos/cbild/CbIldApplication.java`
   - Review services and controllers
   - Check data models in `/model`

2. **Test the APIs**
   - Use Swagger UI at http://localhost:8080/swagger-ui.html
   - Or use cURL commands (examples above)

3. **Explore the Database**
   - Connect with MySQL client
   - Review schema: `DESCRIBE clients;`, etc.
   - Check seed data: `SELECT * FROM users;`

4. **Understand the Modules**
   - KYC Completeness: Data quality scoring
   - Submission Dashboard: Reporting cycles
   - Bureau Monitor: Validation feedback
   - Data Insights: Inquiry logs & alerts
   - Dispute Resolution: Case management

5. **For GSOC Submission**
   - Document your contributions
   - Create pull requests with detailed descriptions
   - Link to this setup guide in your PR
   - Get feedback from mentors

---

## 📝 File Structure for Reference

**Configuration Files** (modify for your environment):
- `docker-compose.yml` - Port, volume mappings
- `backend/src/main/resources/application.yml` - Database, JWT secret
- `frontend/proxy.conf.json` - API proxy configuration

**Source Code** (main implementation):
- `backend/src/main/java/org/mifos/cbild/` - Backend code
- `frontend/src/app/` - Frontend code
- `backend/src/main/resources/db/migration/` - Database migrations

**Documentation** (you're reading this!):
- `README.md` - Project overview
- `SETUP_GUIDE.md` - Installation steps
- `SETUP_CHECKLIST.md` - Verification tests
- `TROUBLESHOOTING.md` - Problem solutions

---

## 🎓 Learning Path

1. **Understand the Problem** (5 min)
   - Read README.md Overview section
   - Review the 5 modules

2. **Set Up the Environment** (5-15 min)
   - Follow SETUP_GUIDE.md
   - Verify with SETUP_CHECKLIST.md

3. **Explore the APIs** (10 min)
   - Open Swagger UI
   - Try some API calls

4. **Review the Code** (30 min)
   - Start with controllers
   - Review services
   - Check data models

5. **Test the Application** (10 min)
   - Log in to frontend
   - Navigate through modules
   - Create/edit test data

6. **Understand the Database** (15 min)
   - Review schema
   - Query sample data
   - Study relationships

---

## ✅ Sign-Off Checklist for GSOC

Before submitting, ensure:

- [ ] Application builds without errors
- [ ] All 5 modules are functional
- [ ] Database migrations work correctly
- [ ] API documentation is complete (Swagger)
- [ ] Tests pass (`mvn test` in backend)
- [ ] Code follows Mifos standards
- [ ] Docker deployment works
- [ ] All default credentials work
- [ ] Setup guide is clear and tested
- [ ] README is comprehensive

---

## 🎉 Conclusion

You now have:
1. ✅ A complete, working CB-ILD application
2. ✅ Multiple setup options (Docker, manual, partial)
3. ✅ Comprehensive troubleshooting guide
4. ✅ Full API documentation
5. ✅ Default test data and credentials
6. ✅ Production-ready deployment

**Status**: Ready for GSOC 2026 evaluation

---

**Created**: March 20, 2026
**Project**: CB-ILD (Mifos Credit Bureau Information Lifecycle Dashboard)
**Author**: Aksh Kaushik (@aksh08022006)
**License**: Mozilla Public License 2.0
