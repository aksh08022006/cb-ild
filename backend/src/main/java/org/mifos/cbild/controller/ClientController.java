package org.mifos.cbild.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.mifos.cbild.dto.ApiResponse;
import org.mifos.cbild.dto.ClientSummaryDto;
import org.mifos.cbild.service.ClientService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clients")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Clients", description = "Client listing and search")
public class ClientController {

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
