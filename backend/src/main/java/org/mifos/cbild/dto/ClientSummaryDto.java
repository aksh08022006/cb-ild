package org.mifos.cbild.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClientSummaryDto {
    private Long id;
    private String fineractClientId;
    private String fullName;
    private String city;
    private String accountStatus;
    private LocalDate activationDate;
}
