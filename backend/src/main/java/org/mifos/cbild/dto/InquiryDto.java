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
public class InquiryDto {
    private Long id;
    private String inquiryType;
    private String inquirySource;
    private String purpose;
    private LocalDate inquiryDate;
}
