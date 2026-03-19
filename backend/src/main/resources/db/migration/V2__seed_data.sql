-- =============================================================
-- CB-ILD Seed Data — V2
-- Demo users, clients, KYC data, submissions, disputes
-- =============================================================

-- Users (passwords are BCrypt encoded; plain: admin123, kyc123, analyst123, comply123)
INSERT INTO users (username, password, email, role) VALUES
('admin',      '$2a$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin@mifos.org',      'ADMIN'),
('kyc_officer','$2a$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'kyc@mifos.org',        'KYC_OFFICER'),
('analyst',    '$2a$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'analyst@mifos.org',    'CREDIT_ANALYST'),
('compliance', '$2a$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'compliance@mifos.org', 'COMPLIANCE');

-- Demo Clients
INSERT INTO clients (fineract_client_id, first_name, last_name, date_of_birth, gender, national_id, mobile_no, email, address_line1, city, state, postal_code, activation_date, account_status) VALUES
('FC-10421', 'Anjali',  'Mehta',  '1988-03-12', 'FEMALE', 'MHTA8803121F', '+91-9876543210', 'anjali@gmail.com', '12 MG Road',       'Mumbai',          'Maharashtra', '400001', '2021-07-01', 'ACTIVE'),
('FC-10478', 'Ravi',    'Kumar',  NULL,          'MALE',   NULL,           '+91-8800112233', NULL,               'Near Bus Stand',   'Patna',           'Bihar',       NULL,     '2023-01-15', 'ACTIVE'),
('FC-10511', 'Priya',   'Nair',   '1995-11-30', 'FEMALE', 'NRPR9511302F', NULL,             'p.nair@gmail.com', '45 Kovalam Rd',    'Thiruvananthapuram','Kerala',    '695001', '2022-05-20', 'ACTIVE'),
('FC-10590', 'Mohammed','Sheikh', '1980-06-15', 'MALE',   'SHKM8006151M', '+91-9988776655', 'm.sheikh@mail.com','Plot 7, Sector 12','Hyderabad',       'Telangana',   '500035', '2020-03-10', 'ACTIVE'),
('FC-10612', 'Sunita',  'Devi',   '1972-09-22', 'FEMALE', 'DVSN7209221F', '+91-9123456789', NULL,               'Village Rampur',   'Lucknow',         'UP',          '226001', '2019-11-05', 'CLOSED');

-- KYC Fields for Client 1 (Anjali - HIGH score)
INSERT INTO kyc_fields (client_id, field_name, fineract_field, bureau_field, field_value, status, warning_note) VALUES
(1, 'Full Name',      'firstname + lastname', 'K4_NAME',        'Anjali Mehta',      'OK',       NULL),
(1, 'Date of Birth',  'dateOfBirth',          'K4_DOB',         '1988-03-12',        'OK',       NULL),
(1, 'National ID',    'externalId',           'K4_ID_NUMBER',   'MHTA8803121F',      'OK',       NULL),
(1, 'Address Line 1', 'addressLine1',         'K4_ADDRESS_1',   '12 MG Road',        'OK',       NULL),
(1, 'City',           'city',                 'K4_CITY',        'Mumbai',            'OK',       NULL),
(1, 'Postal Code',    'postalCode',           'K4_POSTAL',      '400001',            'OK',       NULL),
(1, 'Mobile Number',  'mobileNo',             'K4_PHONE',       '+91-9876543210',    'OK',       NULL),
(1, 'Email',          'email',                'K4_EMAIL',       'anjali@gmail.com',  'WARN',     'Free domain — lower identity confidence'),
(1, 'Gender',         'gender',               'K4_GENDER',      'FEMALE',            'OK',       NULL),
(1, 'Account Opened', 'activationDate',       'K4_OPEN_DATE',   '2021-07-01',        'OK',       NULL);

-- KYC Fields for Client 2 (Ravi - LOW score, 3 critical gaps)
INSERT INTO kyc_fields (client_id, field_name, fineract_field, bureau_field, field_value, status, warning_note) VALUES
(2, 'Full Name',      'firstname + lastname', 'K4_NAME',        'Ravi Kumar',        'OK',       NULL),
(2, 'Date of Birth',  'dateOfBirth',          'K4_DOB',         NULL,                'CRITICAL', 'Required for Metro 2 submission'),
(2, 'National ID',    'externalId',           'K4_ID_NUMBER',   NULL,                'CRITICAL', 'Missing — blocks bureau submission'),
(2, 'Address Line 1', 'addressLine1',         'K4_ADDRESS_1',   'Near Bus Stand',    'WARN',     'Non-standard address — may fail matching'),
(2, 'City',           'city',                 'K4_CITY',        'Patna',             'OK',       NULL),
(2, 'Postal Code',    'postalCode',           'K4_POSTAL',      NULL,                'CRITICAL', 'Required field'),
(2, 'Mobile Number',  'mobileNo',             'K4_PHONE',       '+91-8800112233',    'OK',       NULL),
(2, 'Email',          'email',                'K4_EMAIL',       NULL,                'MISSING',  NULL),
(2, 'Gender',         'gender',               'K4_GENDER',      'MALE',              'OK',       NULL),
(2, 'Account Opened', 'activationDate',       'K4_OPEN_DATE',   '2023-01-15',        'OK',       NULL);

-- KYC Fields for Client 3 (Priya - MEDIUM score)
INSERT INTO kyc_fields (client_id, field_name, fineract_field, bureau_field, field_value, status, warning_note) VALUES
(3, 'Full Name',      'firstname + lastname', 'K4_NAME',        'Priya Nair',        'OK',       NULL),
(3, 'Date of Birth',  'dateOfBirth',          'K4_DOB',         '1995-11-30',        'OK',       NULL),
(3, 'National ID',    'externalId',           'K4_ID_NUMBER',   'NRPR9511302F',      'WARN',     'Checksum mismatch — verify with client'),
(3, 'Address Line 1', 'addressLine1',         'K4_ADDRESS_1',   '45 Kovalam Rd',     'OK',       NULL),
(3, 'City',           'city',                 'K4_CITY',        'Thiruvananthapuram','OK',       NULL),
(3, 'Postal Code',    'postalCode',           'K4_POSTAL',      '695001',            'OK',       NULL),
(3, 'Mobile Number',  'mobileNo',             'K4_PHONE',       NULL,                'CRITICAL', 'Required for contact verification'),
(3, 'Email',          'email',                'K4_EMAIL',       'p.nair@gmail.com',  'OK',       NULL),
(3, 'Gender',         'gender',               'K4_GENDER',      'FEMALE',            'OK',       NULL),
(3, 'Account Opened', 'activationDate',       'K4_OPEN_DATE',   '2022-05-20',        'OK',       NULL);

-- Submissions
INSERT INTO submissions (client_id, batch_reference, submission_date, reporting_period, status, total_records, accepted_records, rejected_records, submitted_by) VALUES
(1, 'BATCH-2024-03-001', '2024-03-01 09:00:00', '2024-02', 'ACCEPTED', 1, 1, 0, 2),
(2, 'BATCH-2024-03-002', '2024-03-01 09:00:00', '2024-02', 'REJECTED', 1, 0, 1, 2),
(3, 'BATCH-2024-03-003', '2024-03-01 09:00:00', '2024-02', 'PARTIAL',  1, 0, 1, 2),
(1, 'BATCH-2024-04-001', '2024-04-01 09:00:00', '2024-03', 'ACCEPTED', 1, 1, 0, 2),
(4, 'BATCH-2024-04-002', '2024-04-01 09:00:00', '2024-03', 'ACCEPTED', 1, 1, 0, 2);

-- Bureau Feedback
INSERT INTO bureau_feedback (submission_id, error_code, error_category, error_message, affected_field, severity, resolved) VALUES
(2, 'ERR-001', 'MISSING_FIELD',       'Date of birth is required for Metro 2 submission',          'K4_DOB',       'ERROR',   FALSE),
(2, 'ERR-002', 'MISSING_FIELD',       'National ID number is mandatory and cannot be null',        'K4_ID_NUMBER', 'ERROR',   FALSE),
(2, 'ERR-003', 'MISSING_FIELD',       'Postal code missing — record cannot be geo-matched',        'K4_POSTAL',    'ERROR',   FALSE),
(3, 'ERR-004', 'INVALID_ID',          'ID format NRPR9511302F does not pass checksum validation',  'K4_ID_NUMBER', 'ERROR',   FALSE),
(3, 'WARN-001','MISSING_FIELD',       'Mobile number missing — contact verification skipped',      'K4_PHONE',     'WARNING', FALSE);

-- Bureau Records
INSERT INTO bureau_records (client_id, match_confidence, match_score, bureau_status, bureau_id, last_reported_date, retention_years) VALUES
(1, 'HIGH',   94.50, 'ACTIVE',  'BUR-IN-421-2021', '2024-03-01', 7),
(2, 'LOW',    31.00, 'UNKNOWN', NULL,               NULL,         7),
(3, 'MEDIUM', 67.25, 'ACTIVE',  'BUR-IN-511-2022', '2024-03-01', 7),
(4, 'HIGH',   91.00, 'ACTIVE',  'BUR-IN-590-2020', '2024-04-01', 7),
(5, 'HIGH',   88.00, 'CLOSED',  'BUR-IN-612-2019', '2023-06-01', 7);

-- Inquiry Log
INSERT INTO inquiry_log (client_id, inquiry_type, inquiry_source, purpose, inquiry_date) VALUES
(1, 'HARD', 'HDFC Bank',         'Personal Loan Application',    '2024-01-15'),
(1, 'SOFT', 'Mifos Institution', 'Portfolio Review',             '2024-02-01'),
(1, 'HARD', 'Bajaj Finance',     'Consumer Durable Loan',        '2024-03-10'),
(3, 'SOFT', 'Mifos Institution', 'Credit Limit Review',          '2024-02-15'),
(4, 'HARD', 'SBI',               'Home Loan Pre-qualification',  '2024-03-20');

-- Alerts
INSERT INTO alerts (client_id, alert_type, severity, title, description, acknowledged) VALUES
(2, 'KYC_GAP',            'HIGH',   'Critical KYC fields missing',         '3 mandatory fields missing. Bureau submission will be rejected until resolved.', FALSE),
(3, 'KYC_GAP',            'HIGH',   'Mobile number not on record',         'Mobile number is required for bureau contact verification.',                     FALSE),
(3, 'SUBMISSION_REJECTED','MEDIUM', 'National ID checksum failure',        'NRPR9511302F failed bureau checksum validation. Verify with client.',            FALSE),
(1, 'SCORE_DROP',         'LOW',    'Minor score change detected',         'Credit score dropped 12 points in last reporting cycle.',                        TRUE);

-- Disputes
INSERT INTO disputes (client_id, case_reference, dispute_type, status, description, institution_value, bureau_value, disputed_field, assigned_to) VALUES
(3, 'DISP-2024-001', 'WRONG_BALANCE',      'OPEN',         'Bureau shows outstanding balance of ₹45,000 but client paid in full on 2024-02-28.', '₹0 (Paid in Full)', '₹45,000 outstanding', 'Current Balance',  2),
(2, 'DISP-2024-002', 'IDENTITY_MISMATCH',  'UNDER_REVIEW', 'Bureau matched this record to a different customer with similar name in same city.',   'Ravi Kumar, DOB unknown', 'Ravi Kumar Sharma', 'Full Name / DOB', 3),
(1, 'DISP-2024-003', 'WRONG_STATUS',       'RESOLVED',     'Account incorrectly marked as Closed at bureau despite being Active.', 'ACTIVE', 'CLOSED', 'Account Status', 2);

-- Dispute Audit Trail
INSERT INTO dispute_audit_log (dispute_id, action, old_status, new_status, notes, performed_by) VALUES
(1, 'OPENED',        NULL,           'OPEN',         'Dispute raised by client during field officer visit', 2),
(2, 'OPENED',        NULL,           'OPEN',         'Identity mismatch detected during batch review',      3),
(2, 'STATUS_CHANGE', 'OPEN',         'UNDER_REVIEW', 'Escalated to credit analyst for investigation',       3),
(3, 'OPENED',        NULL,           'OPEN',         'Status discrepancy found during monthly audit',       2),
(3, 'STATUS_CHANGE', 'OPEN',         'UNDER_REVIEW', 'Bureau contacted with correction request',            2),
(3, 'RESOLVED',      'UNDER_REVIEW', 'RESOLVED',     'Bureau confirmed correction. Status updated to ACTIVE.', 1);

-- Global Audit Log
INSERT INTO audit_log (entity_type, entity_id, action, performed_by, ip_address, detail) VALUES
('CLIENT',     1, 'KYC_SCORE_VIEWED',    2, '192.168.1.10', 'KYC score computed: 93'),
('SUBMISSION', 1, 'SUBMISSION_CREATED',  2, '192.168.1.10', 'Batch BATCH-2024-03-001 submitted'),
('SUBMISSION', 2, 'SUBMISSION_REJECTED', 2, '192.168.1.10', 'Batch BATCH-2024-03-002 rejected by bureau'),
('DISPUTE',    3, 'DISPUTE_RESOLVED',    1, '192.168.1.1',  'Case DISP-2024-003 closed after bureau correction');
