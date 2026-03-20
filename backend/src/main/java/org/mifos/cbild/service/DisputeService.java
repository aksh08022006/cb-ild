package org.mifos.cbild.service;

import org.mifos.cbild.dto.DisputeDto;
import org.mifos.cbild.dto.ResolveDisputeRequest;

import java.util.List;

public interface DisputeService {
    List<DisputeDto> getAllDisputes();
    List<DisputeDto> getByClientId(Long clientId);
    DisputeDto getById(Long id);
    DisputeDto resolveDispute(Long id, ResolveDisputeRequest req);
}
