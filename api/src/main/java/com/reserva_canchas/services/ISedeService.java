package com.reserva_canchas.services;

import com.reserva_canchas.dto.SedeResponse;

import java.util.List;

public interface ISedeService {

    List<SedeResponse> findAll();
}
