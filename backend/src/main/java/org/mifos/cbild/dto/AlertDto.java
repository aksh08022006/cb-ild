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
public class AlertDto {
    private Long id;
    private String alertType;
    private String severity;
    private String title;
    private String description;
    private boolean acknowledged;
    private LocalDateTime createdAt;
}
