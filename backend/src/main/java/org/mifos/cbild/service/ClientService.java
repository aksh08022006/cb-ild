package org.mifos.cbild.service;

import org.mifos.cbild.dto.ClientSummaryDto;

import java.util.List;

public interface ClientService {
    List<ClientSummaryDto> getAllClients();
    ClientSummaryDto getById(Long id);
}
