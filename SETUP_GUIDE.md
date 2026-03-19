# CB-ILD Setup Guide

## Quick Overview
This is a **full-stack Credit Bureau Information Lifecycle Dashboard** for Mifos with:
- **Backend**: Spring Boot 3.2 (Java 17)
- **Frontend**: Angular 17
- **Database**: MySQL 8.0
- **Deployment**: Docker Compose

---

## ⚡ Option 1: Docker Setup (Recommended - Fastest)

### Prerequisites
- Docker and Docker Compose installed
- ~10 minutes

### Steps
```bash
cd /Users/akshkaushik/Downloads/cb-ild
docker-compose up --build
```

**Wait for all services to start** (MySQL → Backend → Frontend)

### Access the Application
- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:8080/api
- **Swagger UI (API Docs)**: http://localhost:8080/swagger-ui.html

### Default Credentials
| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| KYC Officer | `kyc_officer` | `kyc123` |
| Credit Analyst | `analyst` | `analyst123` |
| Compliance | `compliance` | `comply123` |

---

## 🛠️ Option 2: Manual Setup (Local Development)

### Prerequisites
- **Java 17+** → `java -version`
- **Maven 3.9+** → `mvn -version`
- **Node 18+** → `node -v`
- **Angular CLI 17** → `npm install -g @angular/cli@17`
- **MySQL 8.0** → Running on `localhost:3306`

### A. MySQL Database Setup

#### Option A1: Brew (macOS)
```bash
brew install mysql@8.0
brew services start mysql@8.0
mysql -u root -p
```

#### Option A2: Docker (Recommended)
```bash
docker run -d \
  --name cbild-mysql \
  -e MYSQL_ROOT_PASSWORD=rootpass \
  -e MYSQL_DATABASE=cbild_db \
  -e MYSQL_USER=cbild_user \
  -e MYSQL_PASSWORD=cbild_pass \
  -p 3306:3306 \
  mysql:8.0
```

#### Verify Connection
```bash
mysql -h localhost -u cbild_user -p cbild_pass -e "SELECT 1;"
```

---

### B. Backend Setup

```bash
cd /Users/akshkaushik/Downloads/cb-ild/backend

# Verify Java 17
java -version

# Build the project
mvn clean install -DskipTests

# Run the backend
mvn spring-boot:run
```

**Expected Output**:
```
[main] org.mifos.cbild.CbIldApplication : Started CbIldApplication in 12.345 seconds
```

**Backend is ready at**: http://localhost:8080

### C. Frontend Setup

**Open a new terminal**:
```bash
cd /Users/akshkaushik/Downloads/cb-ild/frontend

# Install dependencies
npm install

# Start Angular dev server
npm start
```

**Expected Output**:
```
✔ Compiled successfully.
Application bundle generation complete.
Local: http://localhost:4200/
```

**Frontend is ready at**: http://localhost:4200

---

## 📋 Setup Verification Checklist

After starting the application:

- [ ] **MySQL**: Run `mysql -u cbild_user -p cbild_pass cbild_db -e "SHOW TABLES;"` → Should see: `kyc_fields`, `submissions`, `disputes`, `audit_log`, `users`

- [ ] **Backend Health Check**: 
  ```bash
  curl http://localhost:8080/api/health
  ```
  Expected: `{"status":"UP"}`

- [ ] **Frontend Health Check**: 
  ```bash
  curl http://localhost:4200 | head -20
  ```
  Expected: HTML with `<!DOCTYPE html>`

- [ ] **API Documentation**: Open http://localhost:8080/swagger-ui.html

- [ ] **Login**: Navigate to http://localhost:4200
  - Use username: `admin`, password: `admin123`
  - Should see the dashboard with 5 modules

---

## 🏗️ Project Structure

```
cb-ild/
├── backend/
│   ├── src/main/java/org/mifos/cbild/
│   │   ├── CbIldApplication.java          # Spring Boot entry point
│   │   ├── controller/                     # REST endpoints
│   │   ├── service/                        # Business logic
│   │   ├── model/                          # JPA entities
│   │   ├── repository/                     # Data access
│   │   ├── dto/                            # Data transfer objects
│   │   ├── config/                         # Spring configuration
│   │   └── security/                       # JWT auth
│   ├── src/main/resources/
│   │   ├── application.yml                 # Configuration
│   │   └── db/migration/                   # Flyway migrations
│   └── pom.xml                             # Maven dependencies
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── app.config.ts               # App config
│   │   │   ├── app.routes.ts               # Routing
│   │   │   ├── core/                       # Auth, guards, interceptors
│   │   │   ├── modules/                    # 5 feature modules
│   │   │   └── shared/                     # Shared services
│   │   └── main.ts                         # Entry point
│   ├── package.json                        # NPM dependencies
│   └── angular.json                        # Angular config
│
└── docker-compose.yml                      # Full stack composition
```

---

## 📚 The 5 Modules

| Module | Route | Purpose |
|--------|-------|---------|
| **KYC Completeness** | `/kyc-completeness` | Data quality scoring |
| **Submission Dashboard** | `/submissions` | Track reporting cycles |
| **Bureau Monitor** | `/bureau-monitor` | Validation feedback |
| **Data Insights** | `/data-insights` | Inquiry logs & alerts |
| **Dispute Resolution** | `/disputes` | Case management |

---

## 🐛 Troubleshooting

### MySQL Connection Error
```
java.sql.SQLException: Access denied for user 'cbild_user'
```
**Fix**: Verify MySQL is running and credentials match:
```bash
docker ps | grep mysql
mysql -h localhost -u cbild_user -p cbild_pass -e "SELECT 1;"
```

### Port Already in Use
```bash
# Kill process on port 8080
lsof -i :8080 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Kill process on port 4200
lsof -i :4200 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### Frontend Not Connecting to Backend
- Check `frontend/proxy.conf.json` → Must point to `http://localhost:8080`
- Clear browser cache and restart `npm start`

### Flyway Migration Error
```
Unable to obtain Jdbc Connection
```
**Fix**: Ensure MySQL database exists:
```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS cbild_db;"
```

---

## 🚀 Next Steps

1. **Explore the API**: Visit http://localhost:8080/swagger-ui.html
2. **Login**: Use admin credentials at http://localhost:4200
3. **Review Code**: Start with [backend/src/main/java/org/mifos/cbild/CbIldApplication.java](backend/src/main/java/org/mifos/cbild/CbIldApplication.java)
4. **Test Endpoints**: Use Swagger UI or Postman
5. **Check Logs**: 
   - Backend: `docker logs cbild-backend` (if using Docker)
   - Frontend: Check browser console (F12)

---

## 📖 Additional Resources

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Angular Documentation](https://angular.io/docs)
- [Flyway Database Migrations](https://flywaydb.org)
- [JWT Authentication](https://jwt.io)
- [Mifos Community](https://mifos.org)

---

## ❓ Questions?

Check the [README.md](README.md) for API reference and database schema details.
