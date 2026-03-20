package org.mifos.cbild.dto;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ClientDetailDto {
    private Long id;
    private String fineractClientId;
    private String firstName;
    private String lastName;
    private String fullName;
    private LocalDate dateOfBirth;
    private String gender;
    private String nationalId;
    private String mobileNo;
    private String email;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String postalCode;
    private String country;
    private LocalDate activationDate;
    private String accountStatus;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // KYC related
    private Integer kycCompleteness; // 0-100
    private String kycReadinessLevel; // HIGH, MEDIUM, LOW
    private String bureauReadiness; // Ready, Partial, Not Ready
}
