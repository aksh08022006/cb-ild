package org.mifos.cbild.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KycFieldDto {
    private String fieldName;
    private String fineractField;
    private String bureauField;
    private String fieldValue;
    private String status;
    private String warningNote;
}
