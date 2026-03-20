package org.mifos.cbild.repository;

import org.mifos.cbild.model.DisputeAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DisputeAuditLogRepository extends JpaRepository<DisputeAuditLog, Long> {
    List<DisputeAuditLog> findByDisputeIdOrderByPerformedAtAsc(Long disputeId);
}
