package org.mifos.cbild.service;

import lombok.RequiredArgsConstructor;
import org.mifos.cbild.dto.*;
import org.mifos.cbild.model.*;
import org.mifos.cbild.repository.AlertRepository;
import org.mifos.cbild.repository.ClientRepository;
import org.mifos.cbild.repository.InquiryLogRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InsightsService {

    private final InquiryLogRepository inquiryLogRepository;
    private final AlertRepository alertRepository;
    private final ClientRepository clientRepository;

    public InsightsResponse getInsights(Long clientId) {
        var client = clientRepository.findById(clientId)
            .orElseThrow(() -> new RuntimeException("Client not found: " + clientId));

        List<InquiryLog> inquiries = inquiryLogRepository.findByClientIdOrderByInquiryDateDesc(clientId);
        List<Alert> alerts = alertRepository.findByClientIdOrderByCreatedAtDesc(clientId);

        long hard = inquiries.stream().filter(i -> i.getInquiryType() == InquiryLog.InquiryType.HARD).count();
        long soft = inquiries.stream().filter(i -> i.getInquiryType() == InquiryLog.InquiryType.SOFT).count();
        long unack = alerts.stream().filter(a -> !Boolean.TRUE.equals(a.getAcknowledged())).count();

        return InsightsResponse.builder()
            .clientId(clientId)
            .clientName(client.getFirstName() + " " + client.getLastName())
            .inquiries(inquiries.stream().map(i -> InquiryDto.builder()
                .id(i.getId()).inquiryType(i.getInquiryType().name())
                .inquirySource(i.getInquirySource()).purpose(i.getPurpose())
                .inquiryDate(i.getInquiryDate()).build()).collect(Collectors.toList()))
            .hardInquiryCount((int) hard).softInquiryCount((int) soft)
            .alerts(alerts.stream().map(a -> AlertDto.builder()
                .id(a.getId()).alertType(a.getAlertType().name()).severity(a.getSeverity().name())
                .title(a.getTitle()).description(a.getDescription())
                .acknowledged(Boolean.TRUE.equals(a.getAcknowledged())).createdAt(a.getCreatedAt())
                .build()).collect(Collectors.toList()))
            .unacknowledgedAlerts((int) unack).build();
    }
}
