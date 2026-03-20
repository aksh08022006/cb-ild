package org.mifos.cbild.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.mifos.cbild.dto.*;
import org.mifos.cbild.model.*;
import org.mifos.cbild.repository.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

// ─── Audit Service ────────────────────────────────────────────────────────────
@Service
@RequiredArgsConstructor
@Slf4j
class AuditServiceImpl implements AuditService {
    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    @Override
    public void log(String entityType, Long entityId, String action, String detail) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication() != null
                ? SecurityContextHolder.getContext().getAuthentication().getName() : "system";
            User user = userRepository.findByUsername(username).orElse(null);
            AuditLog entry = AuditLog.builder()
                .entityType(entityType).entityId(entityId)
                .action(action).detail(detail).performedBy(user)
                .build();
            auditLogRepository.save(entry);
        } catch (Exception e) {
            log.warn("Audit log failed: {}", e.getMessage());
        }
    }

    @Override
    public List<AuditLog> getClientAuditTrail(Long clientId) {
        return auditLogRepository.findClientAuditTrail(clientId);
    }
}

// ─── Submission Service ───────────────────────────────────────────────────────
@Service
@RequiredArgsConstructor
@Slf4j
class SubmissionServiceImpl implements SubmissionService {
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

    @Override @Transactional
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

// ─── Bureau Monitor Service ───────────────────────────────────────────────────
@Service
@RequiredArgsConstructor
class BureauMonitorServiceImpl implements BureauMonitorService {
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

// ─── Insights Service ─────────────────────────────────────────────────────────
@Service
@RequiredArgsConstructor
class InsightsServiceImpl implements InsightsService {
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

// ─── Dispute Service ──────────────────────────────────────────────────────────
@Service
@RequiredArgsConstructor
@Transactional
class DisputeServiceImpl implements DisputeService {
    private final DisputeRepository disputeRepository;
    private final DisputeAuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    @Override
    public List<DisputeDto> getAllDisputes() {
        return disputeRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public List<DisputeDto> getByClientId(Long clientId) {
        return disputeRepository.findByClientIdOrderByOpenedAtDesc(clientId)
            .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public DisputeDto getById(Long id) {
        return disputeRepository.findById(id).map(this::toDto)
            .orElseThrow(() -> new RuntimeException("Dispute not found: " + id));
    }

    @Override
    public DisputeDto resolveDispute(Long id, ResolveDisputeRequest req) {
        Dispute dispute = disputeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Dispute not found: " + id));

        String oldStatus = dispute.getStatus().name();
        dispute.setStatus(Dispute.DisputeStatus.valueOf(req.getNewStatus()));
        dispute.setResolutionNotes(req.getResolutionNotes());
        if ("RESOLVED".equals(req.getNewStatus())) {
            dispute.setResolvedAt(LocalDateTime.now());
        }

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User performer = userRepository.findByUsername(username).orElse(null);

        DisputeAuditLog log = DisputeAuditLog.builder()
            .dispute(dispute).action("STATUS_CHANGE")
            .oldStatus(oldStatus).newStatus(req.getNewStatus())
            .notes(req.getResolutionNotes()).performedBy(performer)
            .performedAt(LocalDateTime.now())
            .build();
        auditLogRepository.save(log);

        Dispute saved = disputeRepository.save(dispute);
        auditService.log("DISPUTE", id, "DISPUTE_" + req.getNewStatus(),
            "Case " + dispute.getCaseReference() + " updated to " + req.getNewStatus());
        return toDto(saved);
    }

    private DisputeDto toDto(Dispute d) {
        List<DisputeAuditDto> auditTrail = auditLogRepository.findByDisputeIdOrderByPerformedAtAsc(d.getId())
            .stream().map(a -> DisputeAuditDto.builder()
                .action(a.getAction()).oldStatus(a.getOldStatus()).newStatus(a.getNewStatus())
                .notes(a.getNotes())
                .performedBy(a.getPerformedBy() != null ? a.getPerformedBy().getUsername() : "system")
                .performedAt(a.getPerformedAt())
                .build())
            .collect(Collectors.toList());

        return DisputeDto.builder()
            .id(d.getId())
            .clientName(d.getClient().getFirstName() + " " + d.getClient().getLastName())
            .fineractClientId(d.getClient().getFineractClientId())
            .caseReference(d.getCaseReference())
            .disputeType(d.getDisputeType().name())
            .status(d.getStatus().name())
            .description(d.getDescription())
            .institutionValue(d.getInstitutionValue())
            .bureauValue(d.getBureauValue())
            .disputedField(d.getDisputedField())
            .resolutionNotes(d.getResolutionNotes())
            .assignedTo(d.getAssignedTo() != null ? d.getAssignedTo().getUsername() : null)
            .openedAt(d.getOpenedAt()).resolvedAt(d.getResolvedAt())
            .auditTrail(auditTrail)
            .build();
    }
}
