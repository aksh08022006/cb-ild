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
@Tag(name = "Module 2 - Submission Dashboard")
public class SubmissionController {

    private final SubmissionService submissionService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','KYC_OFFICER','CREDIT_ANALYST','COMPLIANCE')")
    public ResponseEntity<ApiResponse<SubmissionSummaryResponse>> getSummary() {
        return ResponseEntity.ok(ApiResponse.ok(submissionService.getSummary()));
    }

    @GetMapping("/client/{clientId}")
    @PreAuthorize("hasAnyRole('ADMIN','KYC_OFFICER','CREDIT_ANALYST','COMPLIANCE')")
    public ResponseEntity<ApiResponse<List<SubmissionDto>>> getByClient(@PathVariable Long clientId) {
        return ResponseEntity.ok(ApiResponse.ok(submissionService.getByClientId(clientId)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','KYC_OFFICER','CREDIT_ANALYST','COMPLIANCE')")
    public ResponseEntity<ApiResponse<SubmissionDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(submissionService.getById(id)));
    }

    @PostMapping("/{clientId}/submit")
    @PreAuthorize("hasAnyRole('ADMIN','KYC_OFFICER')")
    public ResponseEntity<ApiResponse<SubmissionDto>> trigger(@PathVariable Long clientId) {
        return ResponseEntity.ok(ApiResponse.ok("Triggered", submissionService.triggerSubmission(clientId)));
    }
}
