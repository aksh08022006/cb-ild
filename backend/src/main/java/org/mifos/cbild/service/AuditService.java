package org.mifos.cbild.service;

import org.mifos.cbild.model.AuditLog;

import java.util.List;

public interface AuditService {
    void log(String entityType, Long entityId, String action, String detail);
    List<AuditLog> getClientAuditTrail(Long clientId);
}
