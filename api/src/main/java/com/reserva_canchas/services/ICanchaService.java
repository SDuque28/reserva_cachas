package com.reserva_canchas.services;

import com.reserva_canchas.dto.CanchaResponse;
import com.reserva_canchas.dto.HorarioResponse;

import java.time.LocalDate;
import java.util.List;

public interface ICanchaService {

    List<CanchaResponse> findByFilters(Long sedeId, Long tipoId, LocalDate fecha);

    CanchaResponse findById(Long id);

    List<HorarioResponse> findDisponibilidad(Long canchaId, LocalDate fecha);
}
