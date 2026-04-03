package com.reserva_canchas.services;

import com.reserva_canchas.dto.AuthResponse;
import com.reserva_canchas.dto.LoginRequest;
import com.reserva_canchas.dto.RegisterRequest;

public interface IAuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);
}
