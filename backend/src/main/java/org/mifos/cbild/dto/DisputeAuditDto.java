package org.mifos.cbild.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DisputeAuditDto {
    private String action;
    private String oldStatus;
    private String newStatus;
    private String notes;
    private String performedBy;
    private LocalDateTime performedAt;
}
