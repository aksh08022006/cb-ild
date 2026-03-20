package org.mifos.cbild.dto;

import lombok.Data;

@Data
public class ResolveDisputeRequest {
    private String resolutionNotes;
    private String newStatus;
}
