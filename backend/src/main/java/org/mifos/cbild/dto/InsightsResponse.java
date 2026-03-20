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
public class InsightsResponse {
    private Long clientId;
    private String clientName;
    private List<InquiryDto> inquiries;
    private int hardInquiryCount;
    private int softInquiryCount;
    private List<AlertDto> alerts;
    private int unacknowledgedAlerts;
}
