package org.mifos.cbild.repository;

import org.mifos.cbild.model.KycField;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KycFieldRepository extends JpaRepository<KycField, Long> {
    List<KycField> findByClientId(Long clientId);
}
