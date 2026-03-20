package org.mifos.cbild.dto;

import lombok.*;

/**
 * Data quality warning - alerts for potential issues with client data
 */
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ValidationWarning {
    private String severity; // HIGH, MEDIUM, LOW
    private String fieldName;
    private String message;
    private String recommendation;
    
    public static ValidationWarning ofHigh(String field, String msg, String recommendation) {
        return ValidationWarning.builder()
            .severity("HIGH")
            .fieldName(field)
            .message(msg)
            .recommendation(recommendation)
            .build();
    }
    
    public static ValidationWarning ofMedium(String field, String msg, String recommendation) {
        return ValidationWarning.builder()
            .severity("MEDIUM")
            .fieldName(field)
            .message(msg)
            .recommendation(recommendation)
            .build();
    }
}
