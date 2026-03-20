package org.mifos.cbild.service;

import org.mifos.cbild.dto.BureauMonitorResponse;

public interface BureauMonitorService {
    BureauMonitorResponse getMonitorData(Long clientId);
}
