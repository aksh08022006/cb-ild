package org.mifos.cbild.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

// ─── Auth ─────────────────────────────────────────────────────────────────────
@Data @Builder class LoginRequest  { private String username; private String password; }
@Data @Builder class LoginResponse { private String token; private String role; private String username; }

// ─── KYC / Module 1 ──────────────────────────────────────────────────────────
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class KycScoreResponse {
    private Long clientId;
    private String clientName;
    private String fineractClientId;
    private int completenessScore;
    private int totalFields;
    private int okFields;
    private int warnFields;
    private int criticalFields;
    private int missingFields;
    private String readinessLevel;      // HIGH / MEDIUM / LOW
    private String readinessLabel;
    private List<KycFieldDto> fields;
    private List<String> warnings;
}

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class KycFieldDto {
    private String fieldName;
    private String fineractField;
    private String bureauField;
    private String fieldValue;
    private String status;
    private String warningNote;
}

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Metro2PreviewResponse {
    private Long clientId;
    private String clientName;
    private List<Metro2FieldMapping> mappings;
    private int readyCount;
    private int missingCount;
}

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Metro2FieldMapping {
    private String fineractField;
    private String bureauField;
    private String bureauFieldDescription;
    private String value;
    private String status;   // mapped / missing / check
    private boolean required;
}

// ─── Submission / Module 2 ───────────────────────────────────────────────────
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class SubmissionDto {
    private Long id;
    private String clientName;
    private String fineractClientId;
    private String batchReference;
    private LocalDateTime submissionDate;
    private String reportingPeriod;
    private String status;
    private int totalRecords;
    private int acceptedRecords;
    private int rejectedRecords;
    private String submittedBy;
    private List<BureauFeedbackDto> feedbacks;
}

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class SubmissionSummaryResponse {
    private long totalSubmissions;
    private long accepted;
    private long rejected;
    private long partial;
    private long pending;
    private List<SubmissionDto> recentSubmissions;
    private String nextScheduledDate;
    private String lastSubmissionDate;
}

// ─── Bureau Monitor / Module 3 ───────────────────────────────────────────────
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class BureauMonitorResponse {
    private Long clientId;
    private String clientName;
    private String matchConfidence;
    private BigDecimal matchScore;
    private String bureauStatus;
    private String bureauId;
    private LocalDate lastReportedDate;
    private int retentionYears;
    private LocalDate closureDate;
    private Integer negativeCountdownMonths;
    private List<BureauFeedbackDto> unresolvedFeedbacks;
}

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class BureauFeedbackDto {
    private Long id;
    private String errorCode;
    private String errorCategory;
    private String errorMessage;
    private String affectedField;
    private String severity;
    private boolean resolved;
    private LocalDateTime createdAt;
}

// ─── Data Insights / Module 4 ────────────────────────────────────────────────
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class InsightsResponse {
    private Long clientId;
    private String clientName;
    private List<InquiryDto> inquiries;
    private int hardInquiryCount;
    private int softInquiryCount;
    private List<AlertDto> alerts;
    private int unacknowledgedAlerts;
}

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class InquiryDto {
    private Long id;
    private String inquiryType;
    private String inquirySource;
    private String purpose;
    private LocalDate inquiryDate;
}

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AlertDto {
    private Long id;
    private String alertType;
    private String severity;
    private String title;
    private String description;
    private boolean acknowledged;
    private LocalDateTime createdAt;
}

// ─── Dispute Resolution / Module 5 ───────────────────────────────────────────
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DisputeDto {
    private Long id;
    private String clientName;
    private String fineractClientId;
    private String caseReference;
    private String disputeType;
    private String status;
    private String description;
    private String institutionValue;
    private String bureauValue;
    private String disputedField;
    private String resolutionNotes;
    private String assignedTo;
    private LocalDateTime openedAt;
    private LocalDateTime resolvedAt;
    private List<DisputeAuditDto> auditTrail;
}

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DisputeAuditDto {
    private String action;
    private String oldStatus;
    private String newStatus;
    private String notes;
    private String performedBy;
    private LocalDateTime performedAt;
}

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ResolveDisputeRequest {
    private String resolutionNotes;
    private String newStatus;
}

// ─── Shared ───────────────────────────────────────────────────────────────────
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    public static <T> ApiResponse<T> ok(T data)              { return new ApiResponse<>(true, "OK", data); }
    public static <T> ApiResponse<T> ok(String msg, T data)  { return new ApiResponse<>(true, msg, data); }
    public static <T> ApiResponse<T> err(String message)     { return new ApiResponse<>(false, message, null); }
}
