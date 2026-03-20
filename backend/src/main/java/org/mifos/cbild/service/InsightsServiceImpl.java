package org.mifos.cbild.service;

import lombok.RequiredArgsConstructor;
import org.mifos.cbild.dto.AlertDto;
import org.mifos.cbild.dto.InquiryDto;
import org.mifos.cbild.dto.InsightsResponse;
import org.mifos.cbild.model.Alert;
import org.mifos.cbild.model.Client;
import org.mifos.cbild.model.InquiryLog;
import org.mifos.cbild.repository.AlertRepository;
import org.mifos.cbild.repository.ClientRepository;
import org.mifos.cbild.repository.InquiryLogRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InsightsServiceImpl implements InsightsService {
    private final InquiryLogRepository inquiryLogRepository;
    private final AlertRepository alertRepository;
    private final ClientRepository clientRepository;

    @Override
    public InsightsResponse getInsights(Long clientId) {
        Client client = clientRepository.findById(clientId)
            .orElseThrow(() -> new RuntimeException("Client not found: " + clientId));

        List<InquiryLog> inquiries = inquiryLogRepository.findByClientIdOrderByInquiryDateDesc(clientId);
        List<Alert> alerts = alertRepository.findByClientIdOrderByCreatedAtDesc(clientId);

        long hard = inquiries.stream().filter(i -> i.getInquiryType() == InquiryLog.InquiryType.HARD).count();
        long soft = inquiries.stream().filter(i -> i.getInquiryType() == InquiryLog.InquiryType.SOFT).count();
        long unack = alerts.stream().filter(a -> !Boolean.TRUE.equals(a.getAcknowledged())).count();

        List<InquiryDto> inquiryDtos = inquiries.stream()
            .map(i -> InquiryDto.builder().id(i.getId())
                .inquiryType(i.getInquiryType().name())
                .inquirySource(i.getInquirySource())
                .purpose(i.getPurpose())
                .inquiryDate(i.getInquiryDate())
                .build())
            .collect(Collectors.toList());

        List<AlertDto> alertDtos = alerts.stream()
            .map(a -> AlertDto.builder().id(a.getId())
                .alertType(a.getAlertType().name())
                .severity(a.getSeverity().name())
                .title(a.getTitle())
                .description(a.getDescription())
                .acknowledged(Boolean.TRUE.equals(a.getAcknowledged()))
                .createdAt(a.getCreatedAt())
                .build())
            .collect(Collectors.toList());

        return InsightsResponse.builder()
            .clientId(clientId)
            .clientName(client.getFirstName() + " " + client.getLastName())
            .inquiries(inquiryDtos).hardInquiryCount((int) hard).softInquiryCount((int) soft)
            .alerts(alertDtos).unacknowledgedAlerts((int) unack)
            .build();
    }
}
