# CB-ILD Documentation Index

## 🎯 Choose Your Path

### **I'm setting up for the first time** ⏱️ 5-15 minutes
→ **Start with**: [SETUP_GUIDE.md](SETUP_GUIDE.md)

Choose between:
- **Docker** (easiest, 5 min): Run `docker-compose up --build`
- **Manual** (flexible, 10 min): Run backend and frontend separately
- **Automated** (recommended): Run `bash quick-start.sh`

---

### **I just finished setup and want to verify** ⏱️ 5-10 minutes
→ **Use**: [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md)

Verify:
- [ ] All services running
- [ ] Database populated with seed data
- [ ] Backend responds to health checks
- [ ] Frontend loads and you can login
- [ ] All 5 modules accessible

---

### **Something isn't working** ⏱️ 2-5 minutes
→ **Check**: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

Common issues:
- Port already in use
- MySQL connection error
- Backend won't start
- Frontend blank page
- API calls failing
- Login not working

---

### **I need a quick command or reference** ⏱️ 1 minute
→ **Print/Bookmark**: [QUICK_REFERENCE.md](QUICK_REFERENCE.md)

Includes:
- Service endpoints
- Common commands
- API examples
- Login credentials
- Database queries
- Troubleshooting shortcuts

---

### **I need comprehensive project context** ⏱️ 15 minutes
→ **Read**: [GETTING_STARTED.md](GETTING_STARTED.md)

Covers:
- Full architecture
- Technology stack
- All 5 modules explained
- API reference
- User roles
- Next steps

---

### **I'm a GSOC evaluator** ⏱️ 30 minutes total
→ **Follow this path**:

1. **5 min** - Read [README.md](README.md) (Overview)
2. **5 min** - Run: `bash quick-start.sh` → Option 1
3. **3 min** - Open http://localhost:4200 (Test UI)
4. **5 min** - Open http://localhost:8080/swagger-ui.html (Review API)
5. **5 min** - Check code structure:
   - `backend/src/main/java/org/mifos/cbild/`
   - `frontend/src/app/`
6. **2 min** - Read [SETUP_COMPLETE.md](SETUP_COMPLETE.md) (Verification)

---

### **I'm a contributor** ⏱️ 20 minutes
→ **Follow this path**:

1. **2 min** - Read [README.md](README.md)
2. **10 min** - Follow [SETUP_GUIDE.md](SETUP_GUIDE.md) → Choose your setup
3. **5 min** - Work through [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md)
4. **3 min** - Bookmark [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
5. **Keep handy**: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

---

## 📚 All Documentation Files

| File | Purpose | Read Time | Best For |
|------|---------|-----------|----------|
| [README.md](README.md) | Project overview & architecture | 10 min | Context & scope |
| [SETUP_GUIDE.md](SETUP_GUIDE.md) | Installation instructions | 10 min | First-time setup |
| [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md) | Verification & testing | 10 min | Verify setup works |
| [TROUBLESHOOTING.md](TROUBLESHOOTING.md) | Problem solutions | 5 min per issue | Fixing problems |
| [QUICK_REFERENCE.md](QUICK_REFERENCE.md) | Commands & examples | 2 min | Daily reference |
| [GETTING_STARTED.md](GETTING_STARTED.md) | Comprehensive guide | 15 min | Full context |
| [SETUP_COMPLETE.md](SETUP_COMPLETE.md) | What's been done | 5 min | Overview of docs |
| **INDEX.md** (this file) | Documentation map | 2 min | Finding right docs |

---

## 🚀 Quickest Start

```bash
# One command setup:
bash quick-start.sh

# Then choose:
# Option 1: Docker (recommended, 5 min total)
# Option 2: Manual (10 min total)
```

---

## 🎯 Common Questions Answered

**Q: Where do I start?**
→ Run `bash quick-start.sh` or read [SETUP_GUIDE.md](SETUP_GUIDE.md)

**Q: How do I verify everything works?**
→ Follow [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md)

**Q: Something is broken, how do I fix it?**
→ Search [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for your issue

**Q: How do I call the API?**
→ See [QUICK_REFERENCE.md](QUICK_REFERENCE.md) (API Examples section)

**Q: What are the default credentials?**
→ See [QUICK_REFERENCE.md](QUICK_REFERENCE.md) or [SETUP_GUIDE.md](SETUP_GUIDE.md)

**Q: Where is the API documentation?**
→ Open http://localhost:8080/swagger-ui.html (after running the app)

**Q: What ports does this use?**
→ Frontend: 4200 | Backend: 8080 | Database: 3306

**Q: Can I run this without Docker?**
→ Yes! See [SETUP_GUIDE.md](SETUP_GUIDE.md) → Option 2: Manual Setup

**Q: How do I login?**
→ Username: `admin` | Password: `admin123`

**Q: What are the 5 modules?**
→ See [README.md](README.md) → The 5 Modules section

---

## 📂 Project Structure

```
cb-ild/
├── 📄 README.md                    # Start here for context
├── 📄 INDEX.md                     # This file (finding docs)
├── 📄 SETUP_GUIDE.md              # Installation steps
├── 📄 SETUP_CHECKLIST.md          # Verification tests
├── 📄 TROUBLESHOOTING.md          # Problem solutions
├── 📄 QUICK_REFERENCE.md          # Cheat sheet
├── 📄 GETTING_STARTED.md          # Comprehensive guide
├── 📄 SETUP_COMPLETE.md           # What's been done
│
├── 🔨 quick-start.sh              # Automated setup script
├── 🐳 docker-compose.yml          # Full stack deployment
│
├── 📦 backend/                    # Spring Boot application
│   ├── pom.xml
│   ├── src/
│   ├── Dockerfile
│   └── ...
│
├── 📱 frontend/                   # Angular application
│   ├── package.json
│   ├── src/
│   ├── Dockerfile
│   └── ...
│
└── ... (other config files)
```

---

## 🎓 Reading Guide by Role

### Backend Developer
1. [README.md](README.md) - Understand the project
2. [SETUP_GUIDE.md](SETUP_GUIDE.md) - Set up locally
3. `backend/src/main/java/org/mifos/cbild/` - Review code
4. [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - For issues
5. [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - For commands

### Frontend Developer
1. [README.md](README.md) - Understand the project
2. [SETUP_GUIDE.md](SETUP_GUIDE.md) - Set up locally
3. `frontend/src/app/` - Review code
4. [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - For issues
5. [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - For commands

### DevOps/Docker
1. [README.md](README.md) - Project overview
2. `docker-compose.yml` - Deployment configuration
3. `backend/Dockerfile` and `frontend/Dockerfile` - Container configs
4. [SETUP_GUIDE.md](SETUP_GUIDE.md) - Docker option
5. [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Docker issues

### GSOC Evaluator
1. [README.md](README.md) - Project scope (5 min)
2. `bash quick-start.sh` → Option 1 - Test it (5 min)
3. http://localhost:4200 - See the UI (5 min)
4. http://localhost:8080/swagger-ui.html - Review API (5 min)
5. Code review - Check implementation (10 min)

### Database Administrator
1. [README.md](README.md) - Architecture section
2. `backend/src/main/resources/db/migration/` - Database schema
3. [SETUP_GUIDE.md](SETUP_GUIDE.md) - Database setup
4. [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Database issues
5. [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Database queries

### Project Manager
1. [README.md](README.md) - Project overview
2. [SETUP_COMPLETE.md](SETUP_COMPLETE.md) - Status update
3. [GETTING_STARTED.md](GETTING_STARTED.md) - Architecture
4. `bash quick-start.sh` - Verify functionality
5. [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Risk assessment

---

## ⚡ Speed Reference

**Fastest setup**: `bash quick-start.sh` → Option 1 → ~5 minutes

**Fastest verification**: Follow [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md) → ~10 minutes

**Fastest troubleshooting**: Search [TROUBLESHOOTING.md](TROUBLESHOOTING.md) → ~2 minutes

**Fastest API testing**: Open http://localhost:8080/swagger-ui.html → ~2 minutes

**Fastest database review**: Run MySQL queries from [QUICK_REFERENCE.md](QUICK_REFERENCE.md) → ~5 minutes

---

## 🆘 Getting Help

### For Setup Issues
→ [SETUP_GUIDE.md](SETUP_GUIDE.md)

### For Verification Issues
→ [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md)

### For Runtime Issues
→ [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

### For API Questions
→ [QUICK_REFERENCE.md](QUICK_REFERENCE.md) or http://localhost:8080/swagger-ui.html

### For Architecture Questions
→ [README.md](README.md) or [GETTING_STARTED.md](GETTING_STARTED.md)

### For Context
→ [SETUP_COMPLETE.md](SETUP_COMPLETE.md)

---

## ✅ Documentation Checklist

This documentation includes:

- ✅ Quick start guide (multiple options)
- ✅ Step-by-step setup instructions
- ✅ Verification checklist with tests
- ✅ 30+ troubleshooting scenarios
- ✅ Quick reference card (one-page)
- ✅ Comprehensive guide with examples
- ✅ Architecture documentation
- ✅ API examples and reference
- ✅ User roles and authentication info
- ✅ Database schema explanation
- ✅ Sample credentials and test data
- ✅ Automated setup script
- ✅ Docker deployment guide
- ✅ Performance optimization tips
- ✅ GSOC evaluator path

---

## 📞 Need Help?

1. **Stuck on setup?** → [SETUP_GUIDE.md](SETUP_GUIDE.md)
2. **Want to verify?** → [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md)
3. **Something broken?** → [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
4. **Need a command?** → [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
5. **Need context?** → [README.md](README.md) or [GETTING_STARTED.md](GETTING_STARTED.md)

---

## 🎯 Your Next Step

**Choose one**:

1. **I want to set it up** → Go to [SETUP_GUIDE.md](SETUP_GUIDE.md)
2. **I already set it up** → Go to [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md)
3. **Something isn't working** → Go to [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
4. **I need a quick reference** → Go to [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
5. **I want full context** → Go to [GETTING_STARTED.md](GETTING_STARTED.md)
6. **I'm evaluating this** → Go to [README.md](README.md) then run `bash quick-start.sh`

---

**You now have everything needed to set up, deploy, test, and troubleshoot your CB-ILD application!**

---

*Created: March 20, 2026*  
*Project: CB-ILD (Mifos Credit Bureau Information Lifecycle Dashboard)*  
*GSOC: 2026 Proof of Work*
