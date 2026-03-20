package org.mifos.cbild.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.mifos.cbild.dto.ApiResponse;
import org.mifos.cbild.dto.InsightsResponse;
import org.mifos.cbild.service.InsightsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/insights")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Module 4 - Data Insights")
public class InsightsController {

    private final InsightsService insightsService;

    @GetMapping("/{clientId}")
    @Operation(summary = "Inquiry log and monitoring alerts for a client")
    @PreAuthorize("hasAnyRole('ADMIN','CREDIT_ANALYST','COMPLIANCE')")
    public ResponseEntity<ApiResponse<InsightsResponse>> getInsights(@PathVariable Long clientId) {
        return ResponseEntity.ok(ApiResponse.ok(insightsService.getInsights(clientId)));
    }
}
