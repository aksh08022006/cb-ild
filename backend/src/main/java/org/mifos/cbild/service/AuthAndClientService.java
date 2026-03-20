package org.mifos.cbild.service;

import lombok.RequiredArgsConstructor;
import org.mifos.cbild.config.JwtService;
import org.mifos.cbild.dto.*;
import org.mifos.cbild.model.Client;
import org.mifos.cbild.model.User;
import org.mifos.cbild.repository.*;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

// ─── Auth Service ─────────────────────────────────────────────────────────────
@Service
@RequiredArgsConstructor
class AuthService {

    private final AuthenticationManager authManager;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public LoginResponse login(LoginRequest request) {
        authManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );
        User user = userRepository.findByUsername(request.getUsername())
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        String token = jwtService.generateToken(user);
        return LoginResponse.builder()
            .token(token)
            .role(user.getRole().name())
            .username(user.getUsername())
            .build();
    }
}

// ─── Client Service ───────────────────────────────────────────────────────────
@Service
@RequiredArgsConstructor
class ClientService {

    private final ClientRepository clientRepository;

    public List<ClientSummaryDto> getAllClients() {
        return clientRepository.findAll().stream()
            .map(this::toSummary)
            .collect(Collectors.toList());
    }

    public ClientSummaryDto getById(Long id) {
        return clientRepository.findById(id)
            .map(this::toSummary)
            .orElseThrow(() -> new RuntimeException("Client not found: " + id));
    }

    private ClientSummaryDto toSummary(Client c) {
        return ClientSummaryDto.builder()
            .id(c.getId())
            .fineractClientId(c.getFineractClientId())
            .fullName(c.getFirstName() + " " + c.getLastName())
            .city(c.getCity())
            .accountStatus(c.getAccountStatus() != null ? c.getAccountStatus().name() : null)
            .activationDate(c.getActivationDate())
            .build();
    }
}
