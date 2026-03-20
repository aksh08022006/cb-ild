package org.mifos.cbild.repository;

import org.mifos.cbild.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {
    Optional<Client> findByFineractClientId(String fineractClientId);
    List<Client> findByAccountStatus(Client.AccountStatus status);

    @Query("SELECT c FROM Client c WHERE LOWER(c.firstName) LIKE LOWER(CONCAT('%',:q,'%')) " +
           "OR LOWER(c.lastName) LIKE LOWER(CONCAT('%',:q,'%'))")
    List<Client> searchByName(@Param("q") String query);
}

@Repository
public interface KycFieldRepository extends JpaRepository<KycField, Long> {
    List<KycField> findByClientId(Long clientId);
    List<KycField> findByClientIdAndStatus(Long clientId, KycField.KycStatus status);

    @Query("SELECT COUNT(k) FROM KycField k WHERE k.client.id = :cid AND k.status = 'CRITICAL'")
    long countCriticalByClientId(@Param("cid") Long clientId);

    @Query("SELECT COUNT(k) FROM KycField k WHERE k.client.id = :cid AND k.status = 'OK'")
    long countOkByClientId(@Param("cid") Long clientId);
}

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    List<Submission> findByClientIdOrderBySubmissionDateDesc(Long clientId);
    List<Submission> findByStatus(Submission.SubmissionStatus status);

    @Query("SELECT s FROM Submission s WHERE s.client.id = :cid ORDER BY s.submissionDate DESC")
    List<Submission> findLatestByClientId(@Param("cid") Long clientId);

    @Query("SELECT s.status, COUNT(s) FROM Submission s GROUP BY s.status")
    List<Object[]> countByStatus();
}

@Repository
public interface BureauFeedbackRepository extends JpaRepository<BureauFeedback, Long> {
    List<BureauFeedback> findBySubmissionId(Long submissionId);
    List<BureauFeedback> findBySubmissionClientIdAndResolved(Long clientId, Boolean resolved);
}

@Repository
public interface BureauRecordRepository extends JpaRepository<BureauRecord, Long> {
    Optional<BureauRecord> findByClientId(Long clientId);
}

@Repository
public interface DisputeRepository extends JpaRepository<Dispute, Long> {
    List<Dispute> findByClientIdOrderByOpenedAtDesc(Long clientId);
    List<Dispute> findByStatus(Dispute.DisputeStatus status);
    List<Dispute> findByStatusIn(List<Dispute.DisputeStatus> statuses);
    Optional<Dispute> findByCaseReference(String caseReference);
}

@Repository
public interface DisputeAuditLogRepository extends JpaRepository<DisputeAuditLog, Long> {
    List<DisputeAuditLog> findByDisputeIdOrderByPerformedAtAsc(Long disputeId);
}

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {
    List<Alert> findByClientIdOrderByCreatedAtDesc(Long clientId);
    List<Alert> findByClientIdAndAcknowledged(Long clientId, Boolean acknowledged);
    List<Alert> findByAcknowledgedFalseOrderByCreatedAtDesc();
}

@Repository
public interface InquiryLogRepository extends JpaRepository<InquiryLog, Long> {
    List<InquiryLog> findByClientIdOrderByInquiryDateDesc(Long clientId);
    List<InquiryLog> findByClientIdAndInquiryType(Long clientId, InquiryLog.InquiryType type);
}

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByEntityTypeAndEntityIdOrderByPerformedAtDesc(String entityType, Long entityId);

    @Query("SELECT a FROM AuditLog a WHERE a.entityType = 'CLIENT' AND a.entityId = :cid ORDER BY a.performedAt DESC")
    List<AuditLog> findClientAuditTrail(@Param("cid") Long clientId);
}

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
}
