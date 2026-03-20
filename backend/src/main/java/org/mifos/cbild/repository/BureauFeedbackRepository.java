package org.mifos.cbild.repository;

import org.mifos.cbild.model.BureauFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BureauFeedbackRepository extends JpaRepository<BureauFeedback, Long> {
    List<BureauFeedback> findBySubmissionClientIdAndResolved(Long clientId, Boolean resolved);
}
