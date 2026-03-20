package org.mifos.cbild.service;

import org.mifos.cbild.dto.LoginRequest;
import org.mifos.cbild.dto.LoginResponse;

public interface AuthService {
    LoginResponse login(LoginRequest request);
}
