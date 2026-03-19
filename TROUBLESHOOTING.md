# CB-ILD Troubleshooting Guide

## Common Issues & Solutions

### 🔴 Docker Issues

#### 1. Docker Daemon Not Running
**Error**: `Cannot connect to the Docker daemon`

**Solution**:
```bash
# macOS - Start Docker Desktop
open -a Docker

# Wait 30 seconds for daemon to start, then try:
docker ps
```

#### 2. Port 3306 Already in Use
**Error**: `Bind for 0.0.0.0:3306 failed: port is already allocated`

**Solution**:
```bash
# Find process using port 3306
lsof -i :3306

# Kill it
kill -9 <PID>

# Or use different port in docker-compose.yml
# Change "3306:3306" to "3307:3306"

# Then reconnect to MySQL with:
mysql -h 127.0.0.1 -P 3307 -u cbild_user -p
```

#### 3. Port 8080 Already in Use
**Error**: `Bind for 0.0.0.0:8080 failed: port is already allocated`

**Solution**:
```bash
# Find process using port 8080
lsof -i :8080

# Kill it (likely Java process)
kill -9 <PID>

# Restart Docker services
docker-compose restart backend
```

#### 4. Port 4200 Already in Use
**Error**: `Port 4200 is already in use`

**Solution**:
```bash
# If using manual setup, serve on different port:
ng serve --port 4201

# Update proxy.conf.json if needed
```

#### 5. Out of Disk Space
**Error**: `no space left on device` or `cannot reserve space`

**Solution**:
```bash
# Check disk usage
df -h

# Clean up Docker
docker system prune -a --volumes

# If still low, may need to restart Docker:
docker-compose restart

# Check after cleanup:
df -h
```

#### 6. Build Fails - Out of Memory
**Error**: `ERROR: Couldn't find a suitable package offline`

**Solution**:
```bash
# Increase Docker memory allocation
# In Docker Desktop:
# Preferences → Resources → Memory: Set to 4GB or higher

# Then retry:
docker-compose down
docker-compose up --build
```

---

### 🔴 Database Issues

#### 1. MySQL Connection Refused
**Error**: `Cannot connect to MySQL server on 'localhost' (111)`

**Solution**:
```bash
# Check if MySQL container is running
docker ps | grep mysql

# If not running, start it
docker-compose up -d mysql

# Wait 10 seconds, then test connection
sleep 10
mysql -h 127.0.0.1 -u cbild_user -p cbild_pass -e "SELECT 1;"
```

#### 2. Access Denied for User
**Error**: `Access denied for user 'cbild_user'@'localhost'`

**Solution**:
```bash
# Verify credentials in application.yml
cat backend/src/main/resources/application.yml | grep -A 3 datasource

# Verify credentials in docker-compose.yml
cat docker-compose.yml | grep -A 5 mysql

# Both should match these credentials:
# username: cbild_user
# password: cbild_pass
# database: cbild_db

# If they don't match, update application.yml
```

#### 3. Database Does Not Exist
**Error**: `Unknown database 'cbild_db'`

**Solution**:
```bash
# Create database manually
mysql -h localhost -u root -p -e "CREATE DATABASE IF NOT EXISTS cbild_db;"

# Grant permissions
mysql -h localhost -u root -p -e "GRANT ALL ON cbild_db.* TO 'cbild_user'@'%' IDENTIFIED BY 'cbild_pass';"

# Flush privileges
mysql -h localhost -u root -p -e "FLUSH PRIVILEGES;"

# Restart backend
docker-compose restart backend
```

#### 4. Flyway Migration Failed
**Error**: `org.flywaydb.core.api.FlywayException: Validate failed`

**Solution**:
```bash
# Check migration files exist
ls -la backend/src/main/resources/db/migration/

# Check database state
mysql -u cbild_user -p cbild_pass cbild_db -e "SELECT * FROM flyway_schema_history;"

# Reset and rebuild (CAUTION: loses data)
docker-compose down -v
docker-compose up --build

# Or manually fix migrations
# See: backend/src/main/resources/db/migration/V*.sql
```

#### 5. No Tables in Database
**Error**: `Table 'cbild_db.users' doesn't exist`

**Solution**:
```bash
# Check flyway migrations ran
mysql -u cbild_user -p cbild_pass cbild_db -e "SHOW TABLES;"

# If empty, migrations didn't run. Check backend logs:
docker logs cbild-backend | grep -i migration

# Manually run migrations (if needed):
mysql -u cbild_user -p cbild_pass cbild_db < backend/src/main/resources/db/migration/V1__initial_schema.sql
mysql -u cbild_user -p cbild_pass cbild_db < backend/src/main/resources/db/migration/V2__seed_data.sql
```

---

### 🔴 Backend Issues

#### 1. Backend Won't Start
**Error**: `Application failed to start` or container exits

**Solution**:
```bash
# Check logs for error
docker logs cbild-backend

# Look for specific errors:
# - Database connection: Check MySQL is running
# - Port in use: Check port 8080 is free
# - Memory: Increase Docker memory allocation

# Restart with fresh state
docker-compose restart backend

# Or rebuild completely
docker-compose down
docker-compose up --build -d backend
```

#### 2. Health Check Fails
**Error**: `GET http://localhost:8080/api/health` returns error

**Solution**:
```bash
# Test connectivity
curl -v http://localhost:8080/api/health

# If no response, backend isn't ready. Wait longer:
sleep 30
curl http://localhost:8080/api/health

# Check logs
docker logs cbild-backend | tail -50

# Look for "Started CbIldApplication" message
```

#### 3. Swagger UI Not Loading
**Error**: `Cannot GET /swagger-ui.html`

**Solution**:
```bash
# Check backend is running
curl http://localhost:8080/api/health

# Check SpringDoc configuration
# File: backend/src/main/resources/application.yml
cat backend/src/main/resources/application.yml | grep -A 5 springdoc

# Should have:
# springdoc:
#   api-docs:
#     path: /api-docs
#   swagger-ui:
#     path: /swagger-ui.html

# Verify springdoc-openapi dependency
grep -i springdoc backend/pom.xml
```

#### 4. API Endpoints Returning 404
**Error**: `404 Not Found` when calling endpoints

**Solution**:
```bash
# Check if endpoint exists in controller
grep -r "RequestMapping\|GetMapping\|PostMapping" backend/src/main/java/org/mifos/cbild/controller/

# Test a known endpoint
curl http://localhost:8080/api/health

# If health works but others don't, check authentication:
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8080/api/clients

# Get a token first:
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | jq
```

#### 5. CORS Errors
**Error**: `Access to XMLHttpRequest blocked by CORS policy`

**Solution**:
```bash
# Check CORS configuration in SecurityConfig.java
cat backend/src/main/java/org/mifos/cbild/config/SecurityConfig.java | grep -i cors

# Should allow requests from localhost:4200
# Expected config:
# .allowedOrigins("http://localhost:4200")
# .allowedMethods("GET", "POST", "PUT", "DELETE")

# Verify by checking response headers:
curl -i http://localhost:8080/api/health | grep -i "access-control"

# Should show:
# Access-Control-Allow-Origin: http://localhost:4200
```

#### 6. JWT Token Invalid
**Error**: `401 Unauthorized` or `JWT signature does not match`

**Solution**:
```bash
# Verify JWT secret is consistent
# In docker-compose.yml:
grep JWT_SECRET docker-compose.yml

# In application.yml:
grep -A 2 "^jwt:" backend/src/main/resources/application.yml

# Both should match:
# JWT_SECRET: mifos-cbild-gsoc2026-secret-key-aksh08022006

# Get fresh token:
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | jq '.token'

# Use token in requests:
MYTOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | jq -r '.token')

curl -H "Authorization: Bearer $MYTOKEN" http://localhost:8080/api/clients
```

---

### 🔴 Frontend Issues

#### 1. Frontend Won't Start
**Error**: `npm ERR! Cannot find module` or build fails

**Solution**:
```bash
# Clear node_modules and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# Try again
npm start
```

#### 2. Blank Page After Login
**Error**: Dashboard loads but appears empty

**Solution**:
```bash
# Check browser console (F12 → Console)
# Look for JavaScript errors

# Verify API connection:
curl -s http://localhost:8080/api/health

# Check if CORS is configured correctly
# (see Backend → CORS Errors above)

# Restart frontend
# Ctrl+C to stop, then:
npm start
```

#### 3. Cannot Connect to Backend
**Error**: API calls fail, console shows 404 or network errors

**Solution**:
```bash
# Verify backend is running
curl http://localhost:8080/api/health

# Check proxy configuration
cat frontend/proxy.conf.json

# Should have:
# "/api": {
#   "target": "http://localhost:8080"
# }

# Verify proxy is being used:
npm start 2>&1 | grep -i proxy

# Should show proxy configuration being applied

# If using Docker, verify backend is accessible:
docker exec cbild-frontend curl http://backend:8080/api/health

# Restart frontend
npm start
```

#### 4. Styles Not Applied
**Error**: Page loads but looks unstyled

**Solution**:
```bash
# Check styles.scss is imported
head -20 frontend/src/styles.scss

# Clear cache and rebuild
cd frontend
npm run build -- --configuration production
npm start

# Or restart with cache clear:
rm -rf .angular/cache
npm start
```

#### 5. Login Always Fails
**Error**: `Invalid credentials` even with correct username/password

**Solution**:
```bash
# Verify user exists in database
mysql -u cbild_user -p cbild_pass cbild_db -e "SELECT * FROM users WHERE username='admin';"

# Check backend logs for auth errors
docker logs cbild-backend | grep -i auth

# Try logging in via API:
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Should return a token, not an error

# If API works but UI doesn't, check frontend auth service:
# File: frontend/src/app/core/services/auth.service.ts
# (verify username/password field names match backend)
```

#### 6. 404 Errors in Network Tab
**Error**: Some resources return 404 when loading

**Solution**:
```bash
# Check what's 404ing (F12 → Network tab)

# For assets (js, css):
# This usually means build issue, try:
npm run build
npm start

# For API calls:
# Verify backend is running and check proxy:
curl http://localhost:8080/api/health

# Check proxy.conf.json for correct target
```

---

### 🔴 Network & Connectivity

#### 1. Cannot Reach localhost:4200
**Error**: `ERR_CONNECTION_REFUSED`

**Solution**:
```bash
# Check if frontend is running
npm --version  # Verify npm works

# Check if port 4200 is listening
lsof -i :4200

# If not listed, frontend isn't running:
cd frontend
npm start

# Wait 30-60 seconds for build to complete
```

#### 2. Cannot Reach localhost:8080
**Error**: `ERR_CONNECTION_REFUSED`

**Solution**:
```bash
# Check if backend is running
docker ps | grep cbild-backend

# If not running:
docker-compose up -d backend

# Wait 20-30 seconds for startup
sleep 30
curl http://localhost:8080/api/health

# Check logs
docker logs cbild-backend
```

#### 3. DNS Resolution Issues
**Error**: `getaddrinfo ENOTFOUND localhost`

**Solution**:
```bash
# Use IP address instead of hostname
# Change: http://localhost:4200
# To:     http://127.0.0.1:4200

# Or update /etc/hosts
echo "127.0.0.1 localhost" | sudo tee -a /etc/hosts

# Verify
ping -c 1 localhost
```

---

### 🟡 Performance Issues

#### 1. Slow API Response Times
**Error**: API calls take > 5 seconds

**Solution**:
```bash
# Check backend logs for slow queries
docker logs cbild-backend | grep "took"

# Check database performance
mysql -u cbild_user -p cbild_pass cbild_db -e "SHOW ENGINE INNODB STATUS\G" | grep "Last foreign key error"

# Consider adding indexes
# See: backend/src/main/resources/db/migration/V1__initial_schema.sql

# Restart backend for fresh state
docker-compose restart backend
```

#### 2. Frontend Slow to Load
**Error**: Takes > 10 seconds to load dashboard

**Solution**:
```bash
# Check browser DevTools Network tab
# Identify slow-loading resources

# Run production build (more optimized)
cd frontend
npm run build -- --configuration production

# Check bundle size
npm run build -- --stats-json
# Analyze with: webpack-bundle-analyzer dist/cb-ild-frontend/

# Clear browser cache (Ctrl+Shift+Delete)
```

#### 3. High Memory Usage
**Error**: Browser crashes or is very slow

**Solution**:
```bash
# Check for memory leaks in Chrome DevTools
# F12 → Memory → Take heap snapshot

# Restart browser and clear cache

# For Docker containers:
docker stats

# If memory high, restart service:
docker-compose restart backend
```

---

### 🟡 Configuration Issues

#### 1. MySQL Credentials Mismatch
**Error**: Various connection errors with different setups

**Solution**:
```bash
# Verify three places match:

# 1. docker-compose.yml
cat docker-compose.yml | grep -A 8 "mysql:" | grep -E "MYSQL_|SPRING_DATASOURCE"

# 2. application.yml
cat backend/src/main/resources/application.yml | grep -A 3 datasource

# 3. Docker environment variables
docker exec cbild-backend env | grep SPRING_DATASOURCE

# All should match:
# MYSQL_USER: cbild_user
# MYSQL_PASSWORD: cbild_pass
# MYSQL_DATABASE: cbild_db
```

#### 2. JWT Secret Mismatch
**Error**: Cannot decode JWT tokens, 401 errors

**Solution**:
```bash
# Verify secret in two places:

# 1. docker-compose.yml
grep JWT_SECRET docker-compose.yml

# 2. application.yml (used in manual setup)
grep -A 1 "^jwt:" backend/src/main/resources/application.yml

# Should match exactly:
# mifos-cbild-gsoc2026-secret-key-aksh08022006

# If changed, update both files and restart
docker-compose restart backend
```

#### 3. Wrong Database URL
**Error**: `Could not get a resource provider`

**Solution**:
```bash
# Check datasource URL in application.yml
grep "jdbc:mysql" backend/src/main/resources/application.yml

# Should be:
# jdbc:mysql://localhost:3306/cbild_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC

# In Docker, should be:
# jdbc:mysql://mysql:3306/cbild_db (note: 'mysql' is container name)

# Verify it's configured in docker-compose.yml for backend service
grep -A 10 "backend:" docker-compose.yml | grep SPRING_DATASOURCE_URL
```

---

## 📞 Getting Help

If none of these solutions work:

1. **Check Logs Completely**
   ```bash
   docker logs cbild-mysql -n 100
   docker logs cbild-backend -n 100
   docker logs cbild-frontend -n 100
   ```

2. **Get System Info**
   ```bash
   docker --version
   docker-compose --version
   java -version
   mysql --version
   node -v
   ```

3. **Try Fresh Restart**
   ```bash
   docker-compose down -v
   docker-compose up --build
   ```

4. **Check Project on GitHub**
   - Repository: https://github.com/aksh08022006/cb-ild
   - Issues: https://github.com/aksh08022006/cb-ild/issues

5. **Mifos Community Support**
   - Forum: https://mifos.org/community/
   - Discord: [Check Mifos website]

---

## 📋 Quick Reference Commands

```bash
# Docker
docker-compose up -d              # Start all services
docker-compose down               # Stop all services
docker-compose logs -f            # Watch all logs
docker-compose restart            # Restart all services
docker ps                         # List running containers
docker system prune -a --volumes # Deep clean

# Database
mysql -u cbild_user -p cbild_pass cbild_db
SHOW TABLES;                      # List all tables
SELECT COUNT(*) FROM users;       # Check seed data
DESCRIBE clients;                 # Show table structure

# Backend
mvn clean install
mvn spring-boot:run
curl http://localhost:8080/api/health

# Frontend
npm install
npm start
npm run build

# Network Testing
curl -i http://localhost:8080/api/health
curl -i http://localhost:4200
lsof -i :3306                     # What's using port 3306
lsof -i :8080                     # What's using port 8080
lsof -i :4200                     # What's using port 4200
```

---

**Last Updated**: March 20, 2026
**Project**: CB-ILD (Mifos Credit Bureau Information Lifecycle Dashboard)
