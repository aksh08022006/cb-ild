package org.mifos.cbild.repository;

import org.mifos.cbild.model.Dispute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DisputeRepository extends JpaRepository<Dispute, Long> {
    List<Dispute> findByClientIdOrderByOpenedAtDesc(Long clientId);
    List<Dispute> findByStatus(Dispute.DisputeStatus status);
}
