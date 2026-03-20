package org.mifos.cbild.service;

import lombok.RequiredArgsConstructor;
import org.mifos.cbild.dto.BureauFeedbackDto;
import org.mifos.cbild.dto.BureauMonitorResponse;
import org.mifos.cbild.model.BureauRecord;
import org.mifos.cbild.model.Client;
import org.mifos.cbild.repository.BureauFeedbackRepository;
import org.mifos.cbild.repository.BureauRecordRepository;
import org.mifos.cbild.repository.ClientRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BureauMonitorServiceImpl implements BureauMonitorService {
    private final BureauRecordRepository bureauRecordRepository;
    private final BureauFeedbackRepository bureauFeedbackRepository;
    private final ClientRepository clientRepository;

    @Override
    public BureauMonitorResponse getMonitorData(Long clientId) {
        Client client = clientRepository.findById(clientId)
            .orElseThrow(() -> new RuntimeException("Client not found: " + clientId));

        BureauRecord rec = bureauRecordRepository.findByClientId(clientId).orElse(null);

        List<BureauFeedbackDto> unresolvedFeedbacks =
            bureauFeedbackRepository.findBySubmissionClientIdAndResolved(clientId, false)
                .stream().map(f -> BureauFeedbackDto.builder()
                    .id(f.getId()).errorCode(f.getErrorCode())
                    .errorCategory(f.getErrorCategory() != null ? f.getErrorCategory().name() : null)
                    .errorMessage(f.getErrorMessage()).affectedField(f.getAffectedField())
                    .severity(f.getSeverity() != null ? f.getSeverity().name() : null)
                    .resolved(false).createdAt(f.getCreatedAt())
                    .build())
                .collect(Collectors.toList());

        return BureauMonitorResponse.builder()
            .clientId(clientId)
            .clientName(client.getFirstName() + " " + client.getLastName())
            .matchConfidence(rec != null ? rec.getMatchConfidence().name() : "UNKNOWN")
            .matchScore(rec != null ? rec.getMatchScore() : null)
            .bureauStatus(rec != null ? rec.getBureauStatus().name() : "UNKNOWN")
            .bureauId(rec != null ? rec.getBureauId() : null)
            .lastReportedDate(rec != null ? rec.getLastReportedDate() : null)
            .retentionYears(rec != null && rec.getRetentionYears() != null ? rec.getRetentionYears() : 7)
            .closureDate(rec != null ? rec.getClosureDate() : null)
            .negativeCountdownMonths(rec != null ? rec.getNegativeCountdownMonths() : null)
            .unresolvedFeedbacks(unresolvedFeedbacks)
            .build();
    }
}
