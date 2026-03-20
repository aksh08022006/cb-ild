package org.mifos.cbild.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
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
