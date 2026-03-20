package org.mifos.cbild.service;

import lombok.RequiredArgsConstructor;
import org.mifos.cbild.config.JwtService;
import org.mifos.cbild.dto.LoginRequest;
import org.mifos.cbild.dto.LoginResponse;
import org.mifos.cbild.model.User;
import org.mifos.cbild.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

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
