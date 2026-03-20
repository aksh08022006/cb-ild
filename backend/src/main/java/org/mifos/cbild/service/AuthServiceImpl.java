package org.mifos.cbild.service;

import lombok.RequiredArgsConstructor;
import org.mifos.cbild.config.JwtService;
import org.mifos.cbild.dto.LoginRequest;
import org.mifos.cbild.dto.LoginResponse;
import org.mifos.cbild.model.User;
import org.mifos.cbild.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    @Override
    public LoginResponse login(LoginRequest request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        User user = userRepository.findByUsername(request.getUsername())
            .orElseThrow(() -> new RuntimeException("User not found: " + request.getUsername()));

        UserDetails userDetails = user;
        String token = jwtService.generateToken(userDetails);

        return LoginResponse.builder()
            .token(token)
            .role(user.getRole().name())
            .username(user.getUsername())
            .build();
    }
}
