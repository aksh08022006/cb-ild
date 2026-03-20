package org.mifos.cbild.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.mifos.cbild.dto.BureauFeedbackDto;
import org.mifos.cbild.dto.SubmissionDto;
import org.mifos.cbild.dto.SubmissionSummaryResponse;
import org.mifos.cbild.model.Client;
import org.mifos.cbild.model.Submission;
import org.mifos.cbild.repository.ClientRepository;
import org.mifos.cbild.repository.SubmissionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SubmissionServiceImpl implements SubmissionService {
    private final SubmissionRepository submissionRepository;
    private final ClientRepository clientRepository;
    private final AuditService auditService;

    @Override
    public SubmissionSummaryResponse getSummary() {
        List<Submission> all = submissionRepository.findAll();
        long accepted = all.stream().filter(s -> s.getStatus() == Submission.SubmissionStatus.ACCEPTED).count();
        long rejected = all.stream().filter(s -> s.getStatus() == Submission.SubmissionStatus.REJECTED).count();
        long partial  = all.stream().filter(s -> s.getStatus() == Submission.SubmissionStatus.PARTIAL).count();
        long pending  = all.stream().filter(s -> s.getStatus() == Submission.SubmissionStatus.PENDING).count();

        List<SubmissionDto> recent = all.stream()
            .sorted(Comparator.comparing(Submission::getSubmissionDate).reversed())
            .limit(10)
            .map(this::toDto)
            .collect(Collectors.toList());

        String lastDate = all.stream()
            .map(Submission::getSubmissionDate)
            .max(Comparator.naturalOrder())
            .map(d -> d.format(DateTimeFormatter.ofPattern("yyyy-MM-dd")))
            .orElse("N/A");

        return SubmissionSummaryResponse.builder()
            .totalSubmissions(all.size()).accepted(accepted).rejected(rejected)
            .partial(partial).pending(pending).recentSubmissions(recent)
            .lastSubmissionDate(lastDate).nextScheduledDate("2024-05-01")
            .build();
    }

    @Override
    public List<SubmissionDto> getByClientId(Long clientId) {
        return submissionRepository.findByClientIdOrderBySubmissionDateDesc(clientId)
            .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public SubmissionDto getById(Long id) {
        return submissionRepository.findById(id).map(this::toDto)
            .orElseThrow(() -> new RuntimeException("Submission not found: " + id));
    }

    @Override
    @Transactional
    public SubmissionDto triggerSubmission(Long clientId) {
        Client client = clientRepository.findById(clientId)
            .orElseThrow(() -> new RuntimeException("Client not found: " + clientId));
        String ref = "BATCH-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd-HHmm"))
                   + "-" + clientId;
        Submission s = Submission.builder()
            .client(client).batchReference(ref)
            .submissionDate(LocalDateTime.now())
            .reportingPeriod(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM")))
            .status(Submission.SubmissionStatus.PENDING)
            .totalRecords(1).acceptedRecords(0).rejectedRecords(0)
            .build();
        Submission saved = submissionRepository.save(s);
        auditService.log("SUBMISSION", saved.getId(), "SUBMISSION_TRIGGERED",
            "New batch " + ref + " for client " + clientId);
        return toDto(saved);
    }

    private SubmissionDto toDto(Submission s) {
        List<BureauFeedbackDto> feedbacks = s.getFeedbacks() == null ? List.of() :
            s.getFeedbacks().stream().map(f -> BureauFeedbackDto.builder()
                .id(f.getId()).errorCode(f.getErrorCode())
                .errorCategory(f.getErrorCategory() != null ? f.getErrorCategory().name() : null)
                .errorMessage(f.getErrorMessage()).affectedField(f.getAffectedField())
                .severity(f.getSeverity() != null ? f.getSeverity().name() : null)
                .resolved(Boolean.TRUE.equals(f.getResolved()))
                .createdAt(f.getCreatedAt())
                .build()).collect(Collectors.toList());

        return SubmissionDto.builder()
            .id(s.getId())
            .clientName(s.getClient().getFirstName() + " " + s.getClient().getLastName())
            .fineractClientId(s.getClient().getFineractClientId())
            .batchReference(s.getBatchReference())
            .submissionDate(s.getSubmissionDate())
            .reportingPeriod(s.getReportingPeriod())
            .status(s.getStatus().name())
            .totalRecords(s.getTotalRecords() != null ? s.getTotalRecords() : 0)
            .acceptedRecords(s.getAcceptedRecords() != null ? s.getAcceptedRecords() : 0)
            .rejectedRecords(s.getRejectedRecords() != null ? s.getRejectedRecords() : 0)
            .submittedBy(s.getSubmittedBy() != null ? s.getSubmittedBy().getUsername() : "system")
            .feedbacks(feedbacks)
            .build();
    }
}
