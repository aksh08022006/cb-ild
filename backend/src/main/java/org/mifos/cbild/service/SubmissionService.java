package org.mifos.cbild.service;

import org.mifos.cbild.dto.SubmissionDto;
import org.mifos.cbild.dto.SubmissionSummaryResponse;

import java.util.List;

public interface SubmissionService {
    SubmissionSummaryResponse getSummary();
    List<SubmissionDto> getByClientId(Long clientId);
    SubmissionDto getById(Long id);
    SubmissionDto triggerSubmission(Long clientId);
}
