package org.mifos.cbild.repository;

import org.mifos.cbild.model.KycField;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface KycFieldRepository extends JpaRepository<KycField, Long> {
    List<KycField> findByClientId(Long clientId);
    List<KycField> findByClientIdAndStatus(Long clientId, KycField.KycStatus status);

    @Query("SELECT COUNT(k) FROM KycField k WHERE k.client.id = :cid AND k.status = 'CRITICAL'")
    long countCriticalByClientId(@Param("cid") Long clientId);

    @Query("SELECT COUNT(k) FROM KycField k WHERE k.client.id = :cid AND k.status = 'OK'")
    long countOkByClientId(@Param("cid") Long clientId);
}
