package org.mifos.cbild.service;

import lombok.RequiredArgsConstructor;
import org.mifos.cbild.dto.*;
import org.mifos.cbild.model.*;
import org.mifos.cbild.repository.DisputeAuditLogRepository;
import org.mifos.cbild.repository.DisputeRepository;
import org.mifos.cbild.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DisputeService {

    private final DisputeRepository disputeRepository;
    private final DisputeAuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public List<DisputeDto> getAllDisputes() {
        return disputeRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<DisputeDto> getByClientId(Long clientId) {
        return disputeRepository.findByClientIdOrderByOpenedAtDesc(clientId)
            .stream().map(this::toDto).collect(Collectors.toList());
    }

    public DisputeDto getById(Long id) {
        return disputeRepository.findById(id).map(this::toDto)
            .orElseThrow(() -> new RuntimeException("Dispute not found: " + id));
    }

    @Transactional
    public DisputeDto resolveDispute(Long id, ResolveDisputeRequest req) {
        Dispute dispute = disputeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Dispute not found: " + id));
        String oldStatus = dispute.getStatus().name();
        dispute.setStatus(Dispute.DisputeStatus.valueOf(req.getNewStatus()));
        dispute.setResolutionNotes(req.getResolutionNotes());
        if ("RESOLVED".equals(req.getNewStatus())) dispute.setResolvedAt(LocalDateTime.now());

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User performer = userRepository.findByUsername(username).orElse(null);
        DisputeAuditLog log = DisputeAuditLog.builder()
            .dispute(dispute).action("STATUS_CHANGE").oldStatus(oldStatus)
            .newStatus(req.getNewStatus()).notes(req.getResolutionNotes())
            .performedBy(performer).performedAt(LocalDateTime.now()).build();
        auditLogRepository.save(log);

        Dispute saved = disputeRepository.save(dispute);
        auditService.log("DISPUTE", id, "DISPUTE_" + req.getNewStatus(), dispute.getCaseReference());
        return toDto(saved);
    }

    private DisputeDto toDto(Dispute d) {
        List<DisputeAuditDto> trail = auditLogRepository.findByDisputeIdOrderByPerformedAtAsc(d.getId())
            .stream().map(a -> DisputeAuditDto.builder()
                .action(a.getAction()).oldStatus(a.getOldStatus()).newStatus(a.getNewStatus())
                .notes(a.getNotes())
                .performedBy(a.getPerformedBy() != null ? a.getPerformedBy().getUsername() : "system")
                .performedAt(a.getPerformedAt()).build()).collect(Collectors.toList());

        return DisputeDto.builder()
            .id(d.getId())
            .clientName(d.getClient().getFirstName() + " " + d.getClient().getLastName())
            .fineractClientId(d.getClient().getFineractClientId())
            .caseReference(d.getCaseReference()).disputeType(d.getDisputeType().name())
            .status(d.getStatus().name()).description(d.getDescription())
            .institutionValue(d.getInstitutionValue()).bureauValue(d.getBureauValue())
            .disputedField(d.getDisputedField()).resolutionNotes(d.getResolutionNotes())
            .assignedTo(d.getAssignedTo() != null ? d.getAssignedTo().getUsername() : null)
            .openedAt(d.getOpenedAt()).resolvedAt(d.getResolvedAt()).auditTrail(trail).build();
    }
}
