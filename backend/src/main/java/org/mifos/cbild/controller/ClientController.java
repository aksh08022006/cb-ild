package org.mifos.cbild.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.mifos.cbild.dto.ApiResponse;
import org.mifos.cbild.dto.ClientSummaryDto;
import org.mifos.cbild.dto.ClientDetailDto;
import org.mifos.cbild.dto.CreateClientRequest;
import org.mifos.cbild.dto.ValidationWarning;
import org.mifos.cbild.service.ClientService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clients")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Clients", description = "Client management and KYC onboarding")
public class ClientController {

    private final ClientService clientService;

    @GetMapping
    @Operation(summary = "List all clients")
    @PreAuthorize("hasAnyRole('ADMIN','KYC_OFFICER','CREDIT_ANALYST','COMPLIANCE')")
    public ResponseEntity<ApiResponse<List<ClientSummaryDto>>> getAllClients() {
        return ResponseEntity.ok(ApiResponse.ok(clientService.getAllClients()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get client summary by ID")
    @PreAuthorize("hasAnyRole('ADMIN','KYC_OFFICER','CREDIT_ANALYST','COMPLIANCE')")
    public ResponseEntity<ApiResponse<ClientSummaryDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(clientService.getById(id)));
    }

    @GetMapping("/{id}/details")
    @Operation(summary = "Get detailed client information with KYC status")
    @PreAuthorize("hasAnyRole('ADMIN','KYC_OFFICER','CREDIT_ANALYST','COMPLIANCE')")
    public ResponseEntity<ApiResponse<ClientDetailDto>> getDetailedClient(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(clientService.getDetailedClient(id)));
    }

    @PostMapping
    @Operation(summary = "Create new client with KYC onboarding")
    @PreAuthorize("hasAnyRole('ADMIN','KYC_OFFICER')")
    public ResponseEntity<ApiResponse<ClientDetailDto>> createClient(@Valid @RequestBody CreateClientRequest request) {
        ClientDetailDto client = clientService.createClient(request);
        return ResponseEntity.ok(ApiResponse.ok(client));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update client information")
    @PreAuthorize("hasAnyRole('ADMIN','KYC_OFFICER')")
    public ResponseEntity<ApiResponse<ClientDetailDto>> updateClient(
        @PathVariable Long id,
        @Valid @RequestBody CreateClientRequest request) {
        ClientDetailDto client = clientService.updateClient(id, request);
        return ResponseEntity.ok(ApiResponse.ok(client));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete client")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> deleteClient(@PathVariable Long id) {
        clientService.deleteClient(id);
        return ResponseEntity.ok(ApiResponse.ok("Client deleted successfully"));
    }

    @GetMapping("/search")
    @Operation(summary = "Search clients by name")
    @PreAuthorize("hasAnyRole('ADMIN','KYC_OFFICER','CREDIT_ANALYST','COMPLIANCE')")
    public ResponseEntity<ApiResponse<List<ClientSummaryDto>>> searchClients(
        @RequestParam(required = true) String q) {
        return ResponseEntity.ok(ApiResponse.ok(clientService.searchClients(q)));
    }

    @PostMapping("/{id}/validate")
    @Operation(summary = "Validate client data and get data quality warnings")
    @PreAuthorize("hasAnyRole('ADMIN','KYC_OFFICER','CREDIT_ANALYST')")
    public ResponseEntity<ApiResponse<List<ValidationWarning>>> validateClient(
        @PathVariable Long id,
        @Valid @RequestBody CreateClientRequest request) {
        List<ValidationWarning> warnings = clientService.validateClientData(request);
        return ResponseEntity.ok(ApiResponse.ok(warnings));
    }
}
