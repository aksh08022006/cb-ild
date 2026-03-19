-- =============================================================
-- CB-ILD Schema — V1 Initial Migration
-- Mifos Credit Bureau Information Lifecycle Dashboard
-- Author: aksh08022006 | GSoC 2026
-- =============================================================

CREATE TABLE IF NOT EXISTS users (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    username    VARCHAR(50) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    email       VARCHAR(100),
    role        ENUM('ADMIN','KYC_OFFICER','CREDIT_ANALYST','COMPLIANCE') NOT NULL DEFAULT 'KYC_OFFICER',
    active      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clients (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    fineract_client_id VARCHAR(50) NOT NULL UNIQUE,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    date_of_birth   DATE,
    gender          ENUM('MALE','FEMALE','OTHER'),
    national_id     VARCHAR(100),
    mobile_no       VARCHAR(20),
    email           VARCHAR(100),
    address_line1   VARCHAR(200),
    address_line2   VARCHAR(200),
    city            VARCHAR(100),
    state           VARCHAR(100),
    postal_code     VARCHAR(20),
    country         VARCHAR(50) DEFAULT 'IN',
    activation_date DATE,
    account_status  ENUM('ACTIVE','CLOSED','INACTIVE') DEFAULT 'ACTIVE',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- KYC field-level tracking per client
CREATE TABLE IF NOT EXISTS kyc_fields (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    client_id       BIGINT NOT NULL,
    field_name      VARCHAR(100) NOT NULL,
    fineract_field  VARCHAR(100) NOT NULL,
    bureau_field    VARCHAR(100) NOT NULL,
    field_value     VARCHAR(500),
    status          ENUM('OK','WARN','CRITICAL','MISSING') NOT NULL DEFAULT 'MISSING',
    warning_note    VARCHAR(500),
    last_verified   DATETIME,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    UNIQUE KEY uq_client_field (client_id, field_name)
);

-- Bureau submission batches
CREATE TABLE IF NOT EXISTS submissions (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    client_id       BIGINT NOT NULL,
    batch_reference VARCHAR(100) NOT NULL UNIQUE,
    submission_date DATETIME NOT NULL,
    reporting_period VARCHAR(20),
    status          ENUM('PENDING','ACCEPTED','REJECTED','PARTIAL') NOT NULL DEFAULT 'PENDING',
    total_records   INT DEFAULT 0,
    accepted_records INT DEFAULT 0,
    rejected_records INT DEFAULT 0,
    submitted_by    BIGINT,
    metro2_payload  LONGTEXT,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id),
    FOREIGN KEY (submitted_by) REFERENCES users(id)
);

-- Bureau rejection / feedback per submission
CREATE TABLE IF NOT EXISTS bureau_feedback (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    submission_id   BIGINT NOT NULL,
    error_code      VARCHAR(50),
    error_category  ENUM('INVALID_ID','DATE_INCONSISTENCY','MISSING_FIELD','DUPLICATE','MATCH_FAILURE','OTHER'),
    error_message   VARCHAR(1000),
    affected_field  VARCHAR(100),
    severity        ENUM('ERROR','WARNING','INFO') DEFAULT 'ERROR',
    resolved        BOOLEAN DEFAULT FALSE,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE
);

-- Bureau processing status per client
CREATE TABLE IF NOT EXISTS bureau_records (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    client_id           BIGINT NOT NULL UNIQUE,
    match_confidence    ENUM('HIGH','MEDIUM','LOW') DEFAULT 'LOW',
    match_score         DECIMAL(5,2) DEFAULT 0.00,
    bureau_status       ENUM('ACTIVE','CLOSED','NEGATIVE','UNKNOWN') DEFAULT 'UNKNOWN',
    bureau_id           VARCHAR(100),
    last_reported_date  DATE,
    retention_years     INT DEFAULT 7,
    closure_date        DATE,
    negative_countdown_months INT,
    bureau_raw_response LONGTEXT,
    created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id)
);

-- Inquiry log (hard/soft)
CREATE TABLE IF NOT EXISTS inquiry_log (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    client_id       BIGINT NOT NULL,
    inquiry_type    ENUM('HARD','SOFT') NOT NULL,
    inquiry_source  VARCHAR(200),
    purpose         VARCHAR(200),
    inquiry_date    DATE NOT NULL,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- Monitoring alerts (score drops, delinquencies)
CREATE TABLE IF NOT EXISTS alerts (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    client_id       BIGINT NOT NULL,
    alert_type      ENUM('SCORE_DROP','NEW_DELINQUENCY','EARLY_DEFAULT','SUBMISSION_REJECTED','KYC_GAP') NOT NULL,
    severity        ENUM('HIGH','MEDIUM','LOW') NOT NULL DEFAULT 'MEDIUM',
    title           VARCHAR(300) NOT NULL,
    description     VARCHAR(1000),
    acknowledged    BOOLEAN DEFAULT FALSE,
    acknowledged_by BIGINT,
    acknowledged_at DATETIME,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id),
    FOREIGN KEY (acknowledged_by) REFERENCES users(id)
);

-- Dispute cases
CREATE TABLE IF NOT EXISTS disputes (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    client_id           BIGINT NOT NULL,
    case_reference      VARCHAR(100) NOT NULL UNIQUE,
    dispute_type        ENUM('WRONG_BALANCE','WRONG_STATUS','IDENTITY_MISMATCH','DUPLICATE_TRADELINE','OTHER') NOT NULL,
    status              ENUM('OPEN','UNDER_REVIEW','RESOLVED','REJECTED') NOT NULL DEFAULT 'OPEN',
    description         VARCHAR(2000),
    institution_value   VARCHAR(500),
    bureau_value        VARCHAR(500),
    disputed_field      VARCHAR(100),
    resolution_notes    VARCHAR(2000),
    assigned_to         BIGINT,
    opened_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at         DATETIME,
    FOREIGN KEY (client_id) REFERENCES clients(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id)
);

-- Dispute audit trail
CREATE TABLE IF NOT EXISTS dispute_audit_log (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    dispute_id      BIGINT NOT NULL,
    action          VARCHAR(100) NOT NULL,
    old_status      VARCHAR(50),
    new_status      VARCHAR(50),
    notes           VARCHAR(1000),
    performed_by    BIGINT,
    performed_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dispute_id) REFERENCES disputes(id) ON DELETE CASCADE,
    FOREIGN KEY (performed_by) REFERENCES users(id)
);

-- Global audit log
CREATE TABLE IF NOT EXISTS audit_log (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    entity_type     VARCHAR(50) NOT NULL,
    entity_id       BIGINT NOT NULL,
    action          VARCHAR(100) NOT NULL,
    performed_by    BIGINT,
    ip_address      VARCHAR(45),
    detail          TEXT,
    performed_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (performed_by) REFERENCES users(id)
);

-- Indexes for performance
CREATE INDEX idx_kyc_client ON kyc_fields(client_id);
CREATE INDEX idx_submissions_client ON submissions(client_id);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_disputes_client ON disputes(client_id);
CREATE INDEX idx_disputes_status ON disputes(status);
CREATE INDEX idx_alerts_client ON alerts(client_id);
CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_inquiry_client ON inquiry_log(client_id);
