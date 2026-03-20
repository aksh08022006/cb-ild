package org.mifos.cbild.repository;

import org.mifos.cbild.model.InquiryLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InquiryLogRepository extends JpaRepository<InquiryLog, Long> {
    List<InquiryLog> findByClientIdOrderByInquiryDateDesc(Long clientId);
    List<InquiryLog> findByClientIdAndInquiryType(Long clientId, InquiryLog.InquiryType type);
}
