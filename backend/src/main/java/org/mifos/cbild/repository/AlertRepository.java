package org.mifos.cbild.repository;

import org.mifos.cbild.model.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {
    List<Alert> findByClientIdOrderByCreatedAtDesc(Long clientId);
}
