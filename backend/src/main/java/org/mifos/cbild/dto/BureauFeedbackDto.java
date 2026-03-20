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
public class BureauFeedbackDto {
    private Long id;
    private String errorCode;
    private String errorCategory;
    private String errorMessage;
    private String affectedField;
    private String severity;
    private boolean resolved;
    private LocalDateTime createdAt;
}
