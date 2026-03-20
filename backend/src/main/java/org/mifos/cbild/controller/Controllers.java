package org.mifos.cbild.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.mifos.cbild.dto.*;
import org.mifos.cbild.service.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// ─── KYC Controller — Module 1 ───────────────────────────────────────────────
@RestController
@RequestMapping("/api/kyc")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Module 1 — KYC Completeness", description = "KYC scoring, field status, Metro 2 preview")
class KycController {

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

// ─── Submission Controller — Module 2 ────────────────────────────────────────
@RestController
@RequestMapping("/api/submissions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Module 2 — Submission Dashboard", description = "Reporting cycles, submission status, batch management")
class SubmissionController {

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

// ─── Bureau Monitor Controller — Module 3 ────────────────────────────────────
@RestController
@RequestMapping("/api/bureau")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Module 3 — Bureau Processing Monitor", description = "Match confidence, validation feedback, retention status")
class BureauMonitorController {

    private final BureauMonitorService bureauMonitorService;

    @GetMapping("/monitor/{clientId}")
    @Operation(summary = "Get bureau processing status and match confidence for a client")
    @PreAuthorize("hasAnyRole('ADMIN','CREDIT_ANALYST','COMPLIANCE')")
    public ResponseEntity<ApiResponse<BureauMonitorResponse>> getMonitorData(@PathVariable Long clientId) {
        return ResponseEntity.ok(ApiResponse.ok(bureauMonitorService.getMonitorData(clientId)));
    }
}

// ─── Insights Controller — Module 4 ──────────────────────────────────────────
@RestController
@RequestMapping("/api/insights")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Module 4 — Data Usage Insights", description = "Inquiry logs, monitoring alerts, credit profile")
class InsightsController {

    private final InsightsService insightsService;

    @GetMapping("/{clientId}")
    @Operation(summary = "Get full insights — inquiries and alerts for a client")
    @PreAuthorize("hasAnyRole('ADMIN','CREDIT_ANALYST','COMPLIANCE')")
    public ResponseEntity<ApiResponse<InsightsResponse>> getInsights(@PathVariable Long clientId) {
        return ResponseEntity.ok(ApiResponse.ok(insightsService.getInsights(clientId)));
    }
}

// ─── Dispute Controller — Module 5 ───────────────────────────────────────────
@RestController
@RequestMapping("/api/disputes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Module 5 — Dispute Resolution", description = "Case manager, audit trail, dispute workflow")
class DisputeController {

    private final DisputeService disputeService;

    @GetMapping
    @Operation(summary = "Get all disputes")
    @PreAuthorize("hasAnyRole('ADMIN','CREDIT_ANALYST','COMPLIANCE')")
    public ResponseEntity<ApiResponse<List<DisputeDto>>> getAllDisputes() {
        return ResponseEntity.ok(ApiResponse.ok(disputeService.getAllDisputes()));
    }

    @GetMapping("/client/{clientId}")
    @Operation(summary = "Get all disputes for a specific client")
    @PreAuthorize("hasAnyRole('ADMIN','KYC_OFFICER','CREDIT_ANALYST','COMPLIANCE')")
    public ResponseEntity<ApiResponse<List<DisputeDto>>> getByClient(@PathVariable Long clientId) {
        return ResponseEntity.ok(ApiResponse.ok(disputeService.getByClientId(clientId)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get dispute detail with full audit trail")
    @PreAuthorize("hasAnyRole('ADMIN','CREDIT_ANALYST','COMPLIANCE')")
    public ResponseEntity<ApiResponse<DisputeDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(disputeService.getById(id)));
    }

    @PostMapping("/{id}/resolve")
    @Operation(summary = "Update dispute status — resolve, reject, or move to review")
    @PreAuthorize("hasAnyRole('ADMIN','CREDIT_ANALYST','COMPLIANCE')")
    public ResponseEntity<ApiResponse<DisputeDto>> resolve(
            @PathVariable Long id,
            @RequestBody ResolveDisputeRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Dispute updated", disputeService.resolveDispute(id, request)));
    }
}

// ─── Auth Controller ─────────────────────────────────────────────────────────
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Authentication", description = "JWT login")
class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Login and receive JWT token")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(authService.login(request)));
    }
}

// ─── Client Controller ───────────────────────────────────────────────────────
@RestController
@RequestMapping("/api/clients")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Clients", description = "Client listing and search")
class ClientController {

    private final ClientService clientService;

    @GetMapping
    @Operation(summary = "List all clients")
    @PreAuthorize("hasAnyRole('ADMIN','KYC_OFFICER','CREDIT_ANALYST','COMPLIANCE')")
    public ResponseEntity<ApiResponse<List<ClientSummaryDto>>> getAllClients() {
        return ResponseEntity.ok(ApiResponse.ok(clientService.getAllClients()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get client by ID")
    @PreAuthorize("hasAnyRole('ADMIN','KYC_OFFICER','CREDIT_ANALYST','COMPLIANCE')")
    public ResponseEntity<ApiResponse<ClientSummaryDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(clientService.getById(id)));
    }
}
