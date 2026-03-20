package org.mifos.cbild.dto;

import lombok.*;
import jakarta.validation.constraints.*;
import java.time.LocalDate;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CreateClientRequest {

    @NotBlank(message = "Fineract Client ID is required")
    private String fineractClientId;

    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 100, message = "First name must be 2-100 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(min = 2, max = 100, message = "Last name must be 2-100 characters")
    private String lastName;

    @PastOrPresent(message = "Date of birth cannot be in the future")
    private LocalDate dateOfBirth;

    private String gender; // MALE, FEMALE, OTHER

    private String nationalId;

    @Pattern(regexp = "^\\+?[0-9\\-\\s()]{7,20}$", message = "Invalid phone number format")
    private String mobileNo;

    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Address line 1 is required")
    @Size(min = 5, max = 200, message = "Address must be 5-200 characters")
    private String addressLine1;

    private String addressLine2;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "State is required")
    private String state;

    @Pattern(regexp = "^[0-9]{6}$|^$", message = "Postal code must be 6 digits or empty")
    private String postalCode;

    private String country;

    @NotNull(message = "Activation date is required")
    @PastOrPresent(message = "Activation date cannot be in the future")
    private LocalDate activationDate;

    private String accountStatus; // ACTIVE, INACTIVE, CLOSED
}
