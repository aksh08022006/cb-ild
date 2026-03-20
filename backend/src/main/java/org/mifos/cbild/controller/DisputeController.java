package org.mifos.cbild.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.mifos.cbild.dto.ApiResponse;
import org.mifos.cbild.dto.DisputeDto;
import org.mifos.cbild.dto.ResolveDisputeRequest;
import org.mifos.cbild.service.DisputeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/disputes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Module 5 - Dispute Resolution")
public class DisputeController {

    private final DisputeService disputeService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','CREDIT_ANALYST','COMPLIANCE')")
    public ResponseEntity<ApiResponse<List<DisputeDto>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(disputeService.getAllDisputes()));
    }

    @GetMapping("/client/{clientId}")
    @PreAuthorize("hasAnyRole('ADMIN','KYC_OFFICER','CREDIT_ANALYST','COMPLIANCE')")
    public ResponseEntity<ApiResponse<List<DisputeDto>>> getByClient(@PathVariable Long clientId) {
        return ResponseEntity.ok(ApiResponse.ok(disputeService.getByClientId(clientId)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','CREDIT_ANALYST','COMPLIANCE')")
    public ResponseEntity<ApiResponse<DisputeDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(disputeService.getById(id)));
    }

    @PostMapping("/{id}/resolve")
    @Operation(summary = "Update dispute status")
    @PreAuthorize("hasAnyRole('ADMIN','CREDIT_ANALYST','COMPLIANCE')")
    public ResponseEntity<ApiResponse<DisputeDto>> resolve(
            @PathVariable Long id,
            @RequestBody ResolveDisputeRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Updated", disputeService.resolveDispute(id, request)));
    }
}
