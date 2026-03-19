package org.mifos.cbild.service;

import org.mifos.cbild.dto.*;
import org.mifos.cbild.model.AuditLog;
import java.util.List;

public interface AuditService {
    void log(String entityType, Long entityId, String action, String detail);
    List<AuditLog> getClientAuditTrail(Long clientId);
}

interface SubmissionService {
    SubmissionSummaryResponse getSummary();
    List<SubmissionDto> getByClientId(Long clientId);
    SubmissionDto getById(Long id);
    SubmissionDto triggerSubmission(Long clientId);
}

interface BureauMonitorService {
    BureauMonitorResponse getMonitorData(Long clientId);
}

interface InsightsService {
    InsightsResponse getInsights(Long clientId);
}

interface DisputeService {
    List<DisputeDto> getAllDisputes();
    List<DisputeDto> getByClientId(Long clientId);
    DisputeDto getById(Long id);
    DisputeDto resolveDispute(Long id, ResolveDisputeRequest req);
}
