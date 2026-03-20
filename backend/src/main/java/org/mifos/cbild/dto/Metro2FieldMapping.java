package org.mifos.cbild.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Metro2FieldMapping {
    private String fineractField;
    private String bureauField;
    private String bureauFieldDescription;
    private String value;
    private String status;
    private boolean required;
}
