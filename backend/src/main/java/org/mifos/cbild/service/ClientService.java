package org.mifos.cbild.service;

import org.mifos.cbild.dto.ClientSummaryDto;
import org.mifos.cbild.dto.ClientDetailDto;
import org.mifos.cbild.dto.CreateClientRequest;
import org.mifos.cbild.dto.ValidationWarning;

import java.util.List;

public interface ClientService {
    List<ClientSummaryDto> getAllClients();
    ClientSummaryDto getById(Long id);
    ClientDetailDto getDetailedClient(Long id);
    ClientDetailDto createClient(CreateClientRequest request);
    ClientDetailDto updateClient(Long id, CreateClientRequest request);
    void deleteClient(Long id);
    List<ClientSummaryDto> searchClients(String query);
    List<ValidationWarning> validateClientData(CreateClientRequest request);
}
