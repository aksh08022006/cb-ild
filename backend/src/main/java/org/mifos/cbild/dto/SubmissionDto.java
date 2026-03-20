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
