package org.mifos.cbild.service;

import lombok.RequiredArgsConstructor;
import org.mifos.cbild.dto.ClientSummaryDto;
import org.mifos.cbild.model.Client;
import org.mifos.cbild.repository.ClientRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClientServiceImpl implements ClientService {
    private final ClientRepository clientRepository;

    @Override
    public List<ClientSummaryDto> getAllClients() {
        return clientRepository.findAll().stream()
            .map(this::toSummary)
            .collect(Collectors.toList());
    }

    @Override
    public ClientSummaryDto getById(Long id) {
        return clientRepository.findById(id)
            .map(this::toSummary)
            .orElseThrow(() -> new RuntimeException("Client not found: " + id));
    }

    private ClientSummaryDto toSummary(Client c) {
        return ClientSummaryDto.builder()
            .id(c.getId())
            .fineractClientId(c.getFineractClientId())
            .fullName(c.getFirstName() + " " + c.getLastName())
            .city(c.getCity())
            .accountStatus(c.getAccountStatus() != null ? c.getAccountStatus().name() : null)
            .activationDate(c.getActivationDate())
            .build();
    }
}
