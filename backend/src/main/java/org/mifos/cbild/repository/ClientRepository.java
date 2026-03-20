package org.mifos.cbild.repository;

import org.mifos.cbild.model.Client;
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
