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
@Tag(name = "Module 3 — Bureau Processing Monitor", description = "Match confidence, validation feedback, retention status")
public class BureauMonitorController {

    private final BureauMonitorService bureauMonitorService;

    @GetMapping("/monitor/{clientId}")
    @Operation(summary = "Get bureau processing status and match confidence for a client")
    @PreAuthorize("hasAnyRole('ADMIN','CREDIT_ANALYST','COMPLIANCE')")
    public ResponseEntity<ApiResponse<BureauMonitorResponse>> getMonitorData(@PathVariable Long clientId) {
        return ResponseEntity.ok(ApiResponse.ok(bureauMonitorService.getMonitorData(clientId)));
    }
}
