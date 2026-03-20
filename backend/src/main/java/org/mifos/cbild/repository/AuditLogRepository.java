package org.mifos.cbild.repository;

import org.mifos.cbild.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    @Query("SELECT a FROM AuditLog a WHERE a.entityType = 'CLIENT' AND a.entityId = :cid ORDER BY a.performedAt DESC")
    List<AuditLog> findClientAuditTrail(@Param("cid") Long clientId);
}
