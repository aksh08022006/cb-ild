package org.mifos.cbild.dto;

import lombok.*;

/**
 * Request to initialize KYC fields for a newly created client
 * The system will create default KYC field records based on client data
 */
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class KycInitializationRequest {
    private Long clientId;
    private String clientName;
    
    // Will be populated by service with data from client profile
}
