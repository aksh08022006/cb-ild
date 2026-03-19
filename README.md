# Mifos Credit Bureau Information Lifecycle Dashboard (CB-ILD)

[![GSoC 2026](https://img.shields.io/badge/GSoC-2026-orange?logo=google)](https://summerofcode.withgoogle.com/)
[![Mifos](https://img.shields.io/badge/Mifos-X-blue)](https://mifos.org)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-green)](https://spring.io/projects/spring-boot)
[![Angular](https://img.shields.io/badge/Angular-17-red)](https://angular.io)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue)](https://www.mysql.com)
[![License](https://img.shields.io/badge/License-MPL%202.0-brightgreen)](LICENSE)

> **GSoC 2026 Proof of Work** — by [@aksh08022006](https://github.com/aksh08022006)  
> A full-stack implementation of the Credit Bureau Information Lifecycle module for the Mifos WebApp,
> standardizing, visualizing, validating, and managing the end-to-end credit data lifecycle between
> financial institutions and credit bureaus.

---

## Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [The 5 Modules](#the-5-modules)
- [Tech Stack](#tech-stack)
- [Quick Start (Docker)](#quick-start-docker)
- [Manual Setup](#manual-setup)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Contributing](#contributing)

---

## Overview

Many Mifos-based microfinance institutions face a critical gap: credit data submitted to bureaus is
opaque, error-prone, and unauditable. This results in:

- Borrowers excluded from formal credit due to **data errors, not credit behaviour**
- Institutions unable to trace **rejected submissions** or fix **identity mismatches**
- No structured **dispute workflow** when bureau records contradict institution records

The CB-ILD module adds a complete UI and API layer inside Mifos WebApp that mirrors the full
credit information lifecycle — from KYC origination through dispute resolution and archiving.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Angular 17 Frontend                   │
│  Module 1   Module 2   Module 3   Module 4   Module 5   │
│  KYC Score  Submission  Bureau     Insights   Disputes  │
└────────────────────────┬────────────────────────────────┘
                         │ REST/JSON
┌────────────────────────▼────────────────────────────────┐
│              Spring Boot 3.2 Backend (Java 17)          │
│  KycController  SubmissionController  DisputeController │
│  BureauMonitorController  InsightsController            │
│  ─────────────────────────────────────────────────────  │
│  KycScoringService  AuditService  Metro2MappingService  │
│  SubmissionService  DisputeService  AlertService        │
└────────────────────────┬────────────────────────────────┘
                         │ JPA/Hibernate
┌────────────────────────▼────────────────────────────────┐
│                     MySQL 8.0                           │
│  clients  kyc_fields  submissions  bureau_feedback      │
│  disputes  audit_log  inquiry_log  alerts               │
└─────────────────────────────────────────────────────────┘
```

---

## The 5 Modules

| # | Module | Purpose | Fineract Location |
|---|--------|---------|-------------------|
| 1 | **KYC Completeness** | Score data quality at source, flag missing fields | Client Profile → "Credit Bureau Readiness" |
| 2 | **Submission Dashboard** | Track reporting cycles, Metro 2® mapping, status | Dashboards → "Credit Bureau Reporting" |
| 3 | **Bureau Monitor** | Match confidence, validation feedback, retention | Reporting → "Bureau Feedback & Validation" |
| 4 | **Data Insights** | Inquiry logs, credit snapshots, score drop alerts | Client Profile → "Credit Profile (Bureau)" |
| 5 | **Dispute Resolution** | Case manager, side-by-side comparison, audit trail | Client Profile → "Disputes & History" |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 17, Angular Material, TypeScript, RxJS, Chart.js |
| Backend | Spring Boot 3.2, Java 17, Spring Security, Spring Data JPA |
| Database | MySQL 8.0, Flyway migrations |
| Auth | JWT (role-based: KYC Officer, Credit Analyst, Compliance) |
| Docs | SpringDoc OpenAPI 3 (Swagger UI at `/swagger-ui.html`) |
| DevOps | Docker, Docker Compose |

---

## Quick Start (Docker)

```bash
git clone https://github.com/aksh08022006/cb-ild.git
cd cb-ild
docker-compose up --build
```

Then open:
- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:8080/api
- **Swagger UI**: http://localhost:8080/swagger-ui.html

Default credentials:
| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| KYC Officer | `kyc_officer` | `kyc123` |
| Credit Analyst | `analyst` | `analyst123` |
| Compliance | `compliance` | `comply123` |

---

## Manual Setup

### Prerequisites
- Java 17+, Maven 3.9+
- Node 18+, Angular CLI 17
- MySQL 8.0

### Backend
```bash
cd backend
# Update src/main/resources/application.yml with your MySQL credentials
mvn clean install
mvn spring-boot:run
```

### Frontend
```bash
cd frontend
npm install
ng serve
```

### Database
The backend auto-runs Flyway migrations on startup.  
Seed data is included in `V2__seed_data.sql`.

---

## API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/kyc/{clientId}/score` | GET | KYC completeness score + field breakdown |
| `/api/kyc/{clientId}/metro2-preview` | GET | Metro 2® field mapping preview |
| `/api/submissions` | GET | All submissions with status |
| `/api/submissions/{id}` | GET | Single submission detail |
| `/api/submissions/{clientId}/submit` | POST | Trigger new submission |
| `/api/bureau/feedback/{clientId}` | GET | Bureau validation feedback |
| `/api/bureau/match-confidence/{clientId}` | GET | Identity match score |
| `/api/insights/{clientId}/inquiries` | GET | Hard/soft inquiry log |
| `/api/insights/{clientId}/alerts` | GET | Score drop / delinquency alerts |
| `/api/disputes` | GET | All open disputes |
| `/api/disputes/{id}` | GET | Dispute detail with audit trail |
| `/api/disputes/{id}/resolve` | POST | Resolve a dispute |
| `/api/audit/{clientId}` | GET | Full audit log for client |

Full OpenAPI spec available at `/swagger-ui.html` when running.

---

## Database Schema

```
clients ──< kyc_fields
clients ──< submissions ──< bureau_feedback
clients ──< disputes ──< dispute_audit_log
clients ──< inquiry_log
clients ──< alerts
audit_log (global, covers all entities)
```

---

## Contributing

This project follows [Mifos coding standards](https://mifosforge.jira.com/wiki/spaces/MIFOS/pages/4456933).

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/module-name`
3. Commit with conventional commits: `feat:`, `fix:`, `docs:`
4. Open a PR against `develop`

---

## License

Mozilla Public License 2.0 — same as Apache Fineract / Mifos X.
