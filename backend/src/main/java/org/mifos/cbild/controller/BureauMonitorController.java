package org.mifos.cbild.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.mifos.cbild.dto.ApiResponse;
import org.mifos.cbild.dto.BureauMonitorResponse;
import org.mifos.cbild.service.BureauMonitorService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bureau")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Module 3 - Bureau Monitor")
public class BureauMonitorController {

    private final BureauMonitorService bureauMonitorService;

    @GetMapping("/monitor/{clientId}")
    @Operation(summary = "Bureau processing status and match confidence")
    @PreAuthorize("hasAnyRole('ADMIN','CREDIT_ANALYST','COMPLIANCE')")
    public ResponseEntity<ApiResponse<BureauMonitorResponse>> getMonitor(@PathVariable Long clientId) {
        return ResponseEntity.ok(ApiResponse.ok(bureauMonitorService.getMonitorData(clientId)));
    }
}
