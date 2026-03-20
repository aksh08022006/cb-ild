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
    private String readinessLevel;
    private String readinessLabel;
    private List<KycFieldDto> fields;
    private List<String> warnings;
}
