package org.mifos.cbild.dto;

import lombok.*;
import java.time.LocalDate;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ClientSummaryDto {
    private Long id;
    private String fineractClientId;
    private String fullName;
    private String city;
    private String accountStatus;
    private LocalDate activationDate;
}
