package org.mifos.cbild.repository;

import org.mifos.cbild.model.BureauRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BureauRecordRepository extends JpaRepository<BureauRecord, Long> {
    Optional<BureauRecord> findByClientId(Long clientId);
}
