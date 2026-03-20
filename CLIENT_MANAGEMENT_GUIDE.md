# CB-ILD Client Management System - Complete Guide

## Overview
The CB-ILD (Mifos Credit Bureau Information Lifecycle) Dashboard is a comprehensive system for managing credit information between financial institutions and credit bureaus. The **Client Management System** is the first pillar that ensures high-quality credit data at source.

## System Architecture

### 5 Core Workflows
1. **Data Creation & Acquisition** ✅ COMPLETED (This update)
2. **Data Submission** (To be implemented)
3. **Bureau Processing** (To be implemented)
4. **Data Usage & Insights** (To be implemented)
5. **Dispute Resolution & Archiving** (To be implemented)

---

## Part 1: How to Add Clients

### Option A: Using the Web Interface (Recommended)

#### Step 1: Access Add Client Form
1. Log in to the dashboard at `https://cb-ild.vercel.app`
2. Click **"Add New Client"** button on the Clients page
3. Fill out the client form

#### Step 2: Complete the Form

**Required Fields** (marked with *):
- **Fineract Client ID**: Unique identifier from your Fineract instance (e.g., FC-10421)
- **First Name & Last Name**: Client's legal name
- **Date of Birth**: Critical for Metro 2 bureau reporting
- **National ID**: PAN/Aadhaar/Driver's License - **blocks submission if missing**
- **Address Line 1**: Full street address
- **City**: Client's city
- **State**: Client's state
- **Postal Code**: 6-digit postal code (required for Metro 2)
- **Activation Date**: Account opening date

**Optional but Recommended**:
- **Gender**: MALE, FEMALE, OTHER
- **Mobile Number**: Improves identity matching
- **Email**: Note: Free domains (gmail, yahoo) reduce identity confidence
- **Address Line 2**: Apartment/Suite number if applicable
- **Country**: Defaults to IN (India)

#### Step 3: Monitor KYC Completeness Score
As you fill the form, the system calculates:
- **KYC Completeness Score** (0-100%)
  - 85-100%: **HIGH** - Ready to submit to bureau
  - 60-84%: **MEDIUM** - Partial review needed
  - 0-59%: **LOW** - Fix required before submission

#### Step 4: Review Data Quality Warnings
The system highlights issues that could block bureau reporting:
- **HIGH SEVERITY**: Missing critical fields (DOB, National ID, Postal Code)
- **MEDIUM SEVERITY**: Data quality concerns (free email, non-standard address)
- **RECOMMENDATIONS**: Specific actions to improve data quality

#### Step 5: Submit
Click **"Create Client"** to:
- Save client profile
- Auto-initialize all KYC field records
- Start tracking bureau readiness
- Generate audit logs

---

### Option B: Direct Database Insert (For Bulk Operations)

Connect to your Railway MySQL database and execute:

```sql
INSERT INTO clients 
(fineract_client_id, first_name, last_name, date_of_birth, gender, 
 national_id, mobile_no, email, address_line1, city, state, postal_code, 
 country, activation_date, account_status) 
VALUES
('FC-10700', 'John', 'Doe', '1990-05-10', 'MALE', 'JDOE9005101M', 
 '+91-9999000001', 'john@example.com', '123 Main Street', 'Delhi', 'Delhi', 
 '110001', 'IN', '2024-01-01', 'ACTIVE');
```

**After inserting, you must initialize KYC fields** or use the web form which does this automatically.

---

### Option C: API Integration (For Programmatic Adding)

#### Endpoint: POST `/api/clients`

**Request Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "fineractClientId": "FC-10421",
  "firstName": "Anjali",
  "lastName": "Mehta",
  "dateOfBirth": "1988-03-12",
  "gender": "FEMALE",
  "nationalId": "MHTA8803121F",
  "mobileNo": "+91-9876543210",
  "email": "anjali@example.com",
  "addressLine1": "12 MG Road",
  "city": "Mumbai",
  "state": "Maharashtra",
  "postalCode": "400001",
  "country": "IN",
  "activationDate": "2021-07-01",
  "accountStatus": "ACTIVE"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Client created",
  "data": {
    "id": 1,
    "fineractClientId": "FC-10421",
    "firstName": "Anjali",
    "lastName": "Mehta",
    "fullName": "Anjali Mehta",
    "kycCompleteness": 95,
    "kycReadinessLevel": "HIGH",
    "bureauReadiness": "Ready"
  }
}
```

**Role-Based Access**:
- **KYC_OFFICER**: Can create/edit clients ✅
- **CREDIT_ANALYST**: Can view only
- **COMPLIANCE**: Can view & approve
- **ADMIN**: Full access

---

## Part 2: Understanding KYC Completeness Score

### How It's Calculated

The system evaluates 10 critical fields for Metro 2 bureau reporting:

| Field | Weight | Status Levels | Importance |
|-------|--------|--------------|-----------|
| Full Name | 10 pts | OK/CRITICAL | Required |
| Date of Birth | 10 pts | OK/CRITICAL | Metro 2 required |
| National ID | 10 pts | OK/CRITICAL | Blocks submission if missing |
| Address Line 1 | 10 pts | OK/WARN | Required |
| City | 10 pts | OK/MISSING | Required |
| Postal Code | 10 pts | OK/CRITICAL | Metro 2 required |
| Mobile Number | 10 pts | OK/MISSING | Helpful for matching |
| Email | 10 pts | OK/MISSING | Optional |
| Gender | 10 pts | OK/MISSING | Required by bureau |
| Account Opened | 10 pts | OK/MISSING | Required |

### Field Status Meanings

- **OK** (Green ✓): Field present and valid
- **WARN** (Yellow ⚠): Present but may have quality issues
- **CRITICAL** (Red ✗): Missing and blocks bureau submission
- **MISSING**: Field not provided

### Score Interpretation

```
Score >= 90% ➜ HIGH (Ready to submit)
  - All critical fields present
  - No blocking issues
  - Can trigger bureau submission
  - Minimal rejection risk

Score 60-89% ➜ MEDIUM (Partial review needed)
  - Some optional fields missing
  - May need minor corrections
  - Can submit with higher rejection risk
  - Recommend fixing before submission

Score < 60% ➜ LOW (Fix required)
  - Critical fields missing
  - Multiple data quality issues
  - CANNOT submit to bureau
  - Resolve all HIGH severity warnings first
```

---

## Part 3: Data Quality Warnings System

### Warning Types

#### 1. HIGH SEVERITY (Red 🔴)
**Blocks bureau submission**
- Missing First/Last Name
- Missing Date of Birth
- Missing National ID
- Missing Address
- Missing Postal Code

**Action Required**: Must be fixed before submission

#### 2. MEDIUM SEVERITY (Orange 🟠)
**May cause submission rejection**
- Free email domain used (Gmail, Yahoo, etc.)
- Non-standard address format
- Unusually old Date of Birth

**Recommendation**: Fix if possible, but can submit with caution

#### 3. MISSING FIELDS (Gray)
**Optional but helpful**
- Gender not specified
- Mobile number not provided
- Email not provided

---

## Part 4: Backend Architecture

### Database Schema

#### clients table
```sql
CREATE TABLE clients (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    fineract_client_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    gender ENUM('MALE','FEMALE','OTHER'),
    national_id VARCHAR(100),
    mobile_no VARCHAR(20),
    email VARCHAR(100),
    address_line1 VARCHAR(200) NOT NULL,
    address_line2 VARCHAR(200),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20),
    country VARCHAR(50) DEFAULT 'IN',
    activation_date DATE NOT NULL,
    account_status ENUM('ACTIVE','CLOSED','INACTIVE') DEFAULT 'ACTIVE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### kyc_fields table (Auto-populated on client creation)
```sql
CREATE TABLE kyc_fields (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    client_id BIGINT NOT NULL,
    field_name VARCHAR(100) NOT NULL,
    fineract_field VARCHAR(100) NOT NULL,
    bureau_field VARCHAR(100) NOT NULL,  -- Metro 2 field code
    field_value VARCHAR(500),
    status ENUM('OK','WARN','CRITICAL','MISSING') DEFAULT 'MISSING',
    warning_note VARCHAR(500),
    last_verified DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY (client_id, field_name),
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);
```

### Java Classes

#### DTOs (Data Transfer Objects)

**CreateClientRequest** - Request body for creating/updating clients
```java
@Data
public class CreateClientRequest {
    @NotBlank String fineractClientId;
    @NotBlank String firstName;
    @NotBlank String lastName;
    LocalDate dateOfBirth;
    String gender; // MALE, FEMALE, OTHER
    String nationalId;
    String mobileNo;
    String email;
    // ... address fields
    LocalDate activationDate;
    String accountStatus;
}
```

**ClientDetailDto** - Detailed response with KYC status
```java
@Data
public class ClientDetailDto {
    Long id;
    String fineractClientId;
    String firstName;
    String lastName;
    String fullName;
    // ... all client fields
    Integer kycCompleteness;       // 0-100%
    String kycReadinessLevel;      // HIGH, MEDIUM, LOW
    String bureauReadiness;        // Ready, Partial, Not Ready
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
```

**ValidationWarning** - Data quality warnings
```java
@Data
public class ValidationWarning {
    String severity;           // HIGH, MEDIUM, LOW
    String fieldName;
    String message;            // What's wrong
    String recommendation;     // How to fix
}
```

### Services

**ClientService** - Core business logic
```java
public interface ClientService {
    List<ClientSummaryDto> getAllClients();
    ClientDetailDto getDetailedClient(Long id);
    ClientDetailDto createClient(CreateClientRequest request);
    ClientDetailDto updateClient(Long id, CreateClientRequest request);
    void deleteClient(Long id);
    List<ClientSummaryDto> searchClients(String query);
    List<ValidationWarning> validateClientData(CreateClientRequest request);
}
```

**KycScoringService** - Calculates KYC completeness
```java
public class KycScoringService {
    public KycScoreResponse computeScore(Long clientId) {
        // Returns:
        // - completenessScore (0-100)
        // - readinessLevel (HIGH/MEDIUM/LOW)
        // - field-by-field status
        // - warnings list
    }
}
```

### REST Endpoints

| Method | Endpoint | Requires | Purpose |
|--------|----------|----------|---------|
| GET | `/api/clients` | KYC_OFFICER | List all clients |
| GET | `/api/clients/{id}` | KYC_OFFICER | Get client summary |
| GET | `/api/clients/{id}/details` | KYC_OFFICER | Get detailed info with KYC |
| POST | `/api/clients` | KYC_OFFICER | Create client |
| PUT | `/api/clients/{id}` | KYC_OFFICER | Update client |
| DELETE | `/api/clients/{id}` | ADMIN | Delete client |
| GET | `/api/clients/search?q=name` | KYC_OFFICER | Search by name |
| POST | `/api/clients/{id}/validate` | CREDIT_ANALYST | Get data quality warnings |

---

## Part 5: Frontend Architecture

### Components

#### ClientsComponent
Displays list of all clients with actions:
- View profile
- Edit client
- Access KYC completeness
- Access bureau monitor
- Access insights
- Access disputes

#### AddClientComponent (NEW!)
Form for creating/editing clients:
- Real-time KYC completeness calculation
- Form validation with visual feedback
- Data quality warnings display
- Responsive design
- Automatic KYC field initialization

**Usage**:
- New client: Navigate to `/dashboard/add-client`
- Edit client: Navigate to `/dashboard/add-client/{id}`

### API Service Methods

```typescript
// Get all clients
getAll(): Observable<ClientSummaryDto[]>

// Get detailed client with KYC status
getDetails(id: number): Observable<ClientDetailDto>

// Create new client
create(request: CreateClientRequest): Observable<ClientDetailDto>

// Update existing client
update(id: number, request: CreateClientRequest): Observable<ClientDetailDto>

// Delete client
delete(id: number): Observable<string>

// Search clients
search(query: string): Observable<ClientSummaryDto[]>

// Validate data quality
validate(id: number, request: CreateClientRequest): Observable<ValidationWarning[]>
```

---

## Part 6: Deployment Status

### Current Environment
- **Frontend**: https://cb-ild.vercel.app (Vercel)
- **Backend**: https://cb-ild-backend.onrender.com (Render)
- **Database**: Railway (MySQL 9.4)

### Recent Changes
- ✅ Created client management system
- ✅ Added client creation with KYC onboarding
- ✅ Implemented data quality validation
- ✅ Added real-time completeness scoring
- ✅ Created comprehensive form with warnings

### Deployment Timeline
- Push to GitHub → Render builds backend → Vercel deploys frontend
- Build time: ~2-3 minutes per service
- Check status at Dashboard

---

## Part 7: Metro 2 Integration

### Metro 2 Field Mapping

Each KYC field maps to Metro 2 bureau reporting standard:

| Fineract Field | Metro 2 Code | Description | Requirement |
|---|---|---|---|
| firstName + lastName | K4_NAME | Consumer Name | Required |
| dateOfBirth | K4_DOB | Date of Birth | Required |
| externalId | K4_ID_NUMBER | ID Number | Required |
| addressLine1 | K4_ADDRESS_1 | Address | Required |
| city | K4_CITY | City | Required |
| postalCode | K4_POSTAL | Postal Code | Required |
| mobileNo | K4_PHONE | Phone | Optional |
| email | K4_EMAIL | Email | Optional |
| gender | K4_GENDER | Gender | Required |
| activationDate | K4_OPEN_DATE | Account Open Date | Required |

### Bureau Readiness

- **Ready (HIGH)**: All Metro 2 required fields present → Can submit
- **Partial (MEDIUM)**: Some optional fields missing → Can submit with caution
- **Not Ready (LOW)**: Critical fields missing → Cannot submit

---

## Part 8: Next Steps & Roadmap

### Immediate (This Sprint)
✅ Client creation with KYC onboarding
✅ Data quality validation
✅ KYC completeness scoring

### Near-term (Next Sprint)
- [ ] Implement Data Submission Dashboard
  - Submission history tracking
  - Metro 2 mapping preview
  - Rejection feedback handling
  - Submission calendar

- [ ] Bureau Processing Monitor
  - Data matching confidence (HIGH/MEDIUM/LOW)
  - Validation feedback from bureau
  - Match score calculation
  - Retention countdown

- [ ] Data Usage & Insights
  - Inquiry log viewer (hard/soft inquiries)
  - Credit report snapshot
  - Monitoring alerts (score drops, delinquencies)
  - Bureau data consumption tracking

### Later (Final Sprint)
- [ ] Dispute Resolution & Archiving
  - Dispute case manager (OPEN → REVIEW → RESOLVED)
  - Side-by-side data comparison
  - Audit trail with timestamps
  - Account closure workflow
  - Retention countdown visualization

### Features to Build
1. **Bulk Client Import**: Excel/CSV import with validation
2. **Mobile Responsiveness**: Better mobile form experience
3. **Data Encryption**: At-rest and in-transit encryption
4. **Advanced Search**: Filter by status, city, score range
5. **Export Functionality**: Export client list to CSV/Excel
6. **Integration with Fineract**: Real-time sync of client changes

---

## Part 9: Testing the System

### Test Scenario 1: Add Complete Client (HIGH Score)
```
Input: All fields filled with valid data
Expected: KYC score >= 90%, Can submit status shown
Action: Complete the form and verify
```

### Test Scenario 2: Add Incomplete Client (LOW Score)
```
Input: Only name and city provided
Expected: KYC score < 60%, HIGH severity warnings shown
Action: See real-time warnings as you fill the form
```

### Test Scenario 3: Data Quality Validation
```
Input: Email = "test@gmail.com", Address = "Village Rampur"
Expected: MEDIUM severity warnings about free email and address format
Action: Verify recommendations are shown
```

### Test Scenario 4: Edit Existing Client
```
Input: Navigate to /dashboard/add-client/1
Expected: Form pre-filled with client data
Action: Update fields and verify changes saved
```

---

## Troubleshooting

### Issue: "Client with ID X already exists"
**Cause**: Fineract Client ID not unique
**Solution**: Check database for duplicate IDs, use unique ID

### Issue: KYC Score not updating
**Cause**: Form change detection delay
**Solution**: Fill form slowly, wait for calculation to complete

### Issue: Validation warnings not showing
**Cause**: Component not fetching warnings from backend
**Solution**: Check browser console for errors, verify API endpoint

### Issue: Client not saved
**Cause**: Form validation error or API failure
**Solution**: Check all required fields are filled, verify backend logs

---

## Support & Documentation

For complete MB documentation:
- **Mifos**: https://mifos.org
- **Metro 2 Standard**: ISO/IEC 20483
- **Credit Bureau APIs**: https://apihub.io

---

**Last Updated**: March 20, 2026
**Version**: 1.0 - Client Management System
**Status**: Production Ready ✅
