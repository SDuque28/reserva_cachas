package com.reserva_canchas.services;

import com.reserva_canchas.dto.TipoCanchaResponse;

import java.util.List;

public interface ITipoCanchaService {

    List<TipoCanchaResponse> findAll();
}
