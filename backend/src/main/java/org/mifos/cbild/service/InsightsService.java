package org.mifos.cbild.service;

import org.mifos.cbild.dto.InsightsResponse;

public interface InsightsService {
    InsightsResponse getInsights(Long clientId);
}
