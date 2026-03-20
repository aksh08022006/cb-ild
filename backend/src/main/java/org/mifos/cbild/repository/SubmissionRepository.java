package org.mifos.cbild.repository;

import org.mifos.cbild.model.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    List<Submission> findByClientIdOrderBySubmissionDateDesc(Long clientId);
    List<Submission> findByStatus(Submission.SubmissionStatus status);

    @Query("SELECT s FROM Submission s WHERE s.client.id = :cid ORDER BY s.submissionDate DESC")
    List<Submission> findLatestByClientId(@Param("cid") Long clientId);

    @Query("SELECT s.status, COUNT(s) FROM Submission s GROUP BY s.status")
    List<Object[]> countByStatus();
}
