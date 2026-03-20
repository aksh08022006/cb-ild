package org.mifos.cbild.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
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
