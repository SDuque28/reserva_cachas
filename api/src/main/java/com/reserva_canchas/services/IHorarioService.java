package com.reserva_canchas.services;

import com.reserva_canchas.dto.HorarioResponse;

import java.util.List;

public interface IHorarioService {

    List<HorarioResponse> findAll(Long canchaId);
}
