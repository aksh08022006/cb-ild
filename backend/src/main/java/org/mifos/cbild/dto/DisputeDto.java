package org.mifos.cbild.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
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
