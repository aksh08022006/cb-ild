package org.mifos.cbild.service;

import lombok.RequiredArgsConstructor;
import org.mifos.cbild.dto.*;
import org.mifos.cbild.model.BureauRecord;
import org.mifos.cbild.repository.BureauFeedbackRepository;
import org.mifos.cbild.repository.BureauRecordRepository;
import org.mifos.cbild.repository.ClientRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BureauMonitorService {

    private final BureauRecordRepository bureauRecordRepository;
    private final BureauFeedbackRepository bureauFeedbackRepository;
    private final ClientRepository clientRepository;

    public BureauMonitorResponse getMonitorData(Long clientId) {
        var client = clientRepository.findById(clientId)
            .orElseThrow(() -> new RuntimeException("Client not found: " + clientId));
        BureauRecord rec = bureauRecordRepository.findByClientId(clientId).orElse(null);

        List<BureauFeedbackDto> feedbacks =
            bureauFeedbackRepository.findBySubmissionClientIdAndResolved(clientId, false)
                .stream().map(f -> BureauFeedbackDto.builder()
                    .id(f.getId()).errorCode(f.getErrorCode())
                    .errorCategory(f.getErrorCategory() != null ? f.getErrorCategory().name() : null)
                    .errorMessage(f.getErrorMessage()).affectedField(f.getAffectedField())
                    .severity(f.getSeverity() != null ? f.getSeverity().name() : null)
                    .resolved(false).createdAt(f.getCreatedAt()).build())
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
            .unresolvedFeedbacks(feedbacks).build();
    }
}
