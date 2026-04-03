package com.reserva_canchas.services;

import com.reserva_canchas.dto.ReservaCreateRequest;
import com.reserva_canchas.dto.ReservaResponse;

import java.util.List;

public interface IReservaService {

    ReservaResponse create(ReservaCreateRequest request);

    List<ReservaResponse> findMisReservas();

    ReservaResponse cancelar(Long id);
}
