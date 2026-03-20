package org.mifos.cbild.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.mifos.cbild.dto.ApiResponse;
import org.mifos.cbild.dto.SubmissionDto;
import org.mifos.cbild.dto.SubmissionSummaryResponse;
import org.mifos.cbild.service.SubmissionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/submissions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Module 2 — Submission Dashboard", description = "Reporting cycles, submission status, batch management")
public class SubmissionController {

    private final SubmissionService submissionService;

    @GetMapping
    @Operation(summary = "Get submission summary and recent submissions")
    @PreAuthorize("hasAnyRole('ADMIN','KYC_OFFICER','CREDIT_ANALYST','COMPLIANCE')")
    public ResponseEntity<ApiResponse<SubmissionSummaryResponse>> getSummary() {
        return ResponseEntity.ok(ApiResponse.ok(submissionService.getSummary()));
    }

    @GetMapping("/client/{clientId}")
    @Operation(summary = "Get all submissions for a specific client")
    @PreAuthorize("hasAnyRole('ADMIN','KYC_OFFICER','CREDIT_ANALYST','COMPLIANCE')")
    public ResponseEntity<ApiResponse<List<SubmissionDto>>> getByClient(@PathVariable Long clientId) {
        return ResponseEntity.ok(ApiResponse.ok(submissionService.getByClientId(clientId)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a single submission by ID")
    @PreAuthorize("hasAnyRole('ADMIN','KYC_OFFICER','CREDIT_ANALYST','COMPLIANCE')")
    public ResponseEntity<ApiResponse<SubmissionDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(submissionService.getById(id)));
    }

    @PostMapping("/{clientId}/submit")
    @Operation(summary = "Trigger a new bureau submission for a client")
    @PreAuthorize("hasAnyRole('ADMIN','KYC_OFFICER')")
    public ResponseEntity<ApiResponse<SubmissionDto>> triggerSubmission(@PathVariable Long clientId) {
        return ResponseEntity.ok(ApiResponse.ok("Submission triggered", submissionService.triggerSubmission(clientId)));
    }
}
