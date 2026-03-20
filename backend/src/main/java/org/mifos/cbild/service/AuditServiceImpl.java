package org.mifos.cbild.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.mifos.cbild.model.AuditLog;
import org.mifos.cbild.model.User;
import org.mifos.cbild.repository.AuditLogRepository;
import org.mifos.cbild.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditServiceImpl implements AuditService {
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
