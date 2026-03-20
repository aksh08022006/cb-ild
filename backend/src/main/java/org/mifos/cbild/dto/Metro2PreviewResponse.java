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
public class Metro2PreviewResponse {
    private Long clientId;
    private String clientName;
    private List<Metro2FieldMapping> mappings;
    private int readyCount;
    private int missingCount;
}
