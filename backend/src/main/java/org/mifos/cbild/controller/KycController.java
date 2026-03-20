package org.mifos.cbild.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.mifos.cbild.dto.ApiResponse;
import org.mifos.cbild.dto.KycScoreResponse;
import org.mifos.cbild.dto.Metro2PreviewResponse;
import org.mifos.cbild.service.KycScoringService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/kyc")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Module 1 — KYC Completeness", description = "KYC scoring, field status, Metro 2 preview")
public class KycController {

    private final KycScoringService kycScoringService;

    @GetMapping("/{clientId}/score")
    @Operation(summary = "Get KYC completeness score for a client")
    @PreAuthorize("hasAnyRole('ADMIN','KYC_OFFICER','CREDIT_ANALYST','COMPLIANCE')")
    public ResponseEntity<ApiResponse<KycScoreResponse>> getScore(@PathVariable Long clientId) {
        return ResponseEntity.ok(ApiResponse.ok(kycScoringService.computeScore(clientId)));
    }

    @GetMapping("/{clientId}/metro2-preview")
    @Operation(summary = "Preview Metro 2 field mapping for a client")
    @PreAuthorize("hasAnyRole('ADMIN','KYC_OFFICER','CREDIT_ANALYST','COMPLIANCE')")
    public ResponseEntity<ApiResponse<Metro2PreviewResponse>> getMetro2Preview(@PathVariable Long clientId) {
        return ResponseEntity.ok(ApiResponse.ok(kycScoringService.buildMetro2Preview(clientId)));
    }
}
