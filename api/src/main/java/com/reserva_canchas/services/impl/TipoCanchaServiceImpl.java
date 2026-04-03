package com.reserva_canchas.services.impl;

import com.reserva_canchas.dto.TipoCanchaResponse;
import com.reserva_canchas.entities.TipoCancha;
import com.reserva_canchas.repository.TipoCanchaRepository;
import com.reserva_canchas.services.ITipoCanchaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TipoCanchaServiceImpl implements ITipoCanchaService {

    private final TipoCanchaRepository tipoCanchaRepository;

    @Override
    public List<TipoCanchaResponse> findAll() {
        return tipoCanchaRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    private TipoCanchaResponse toResponse(TipoCancha tipoCancha) {
        TipoCanchaResponse response = new TipoCanchaResponse();
        response.setId(tipoCancha.getId());
        response.setNombre(tipoCancha.getNombre());
        return response;
    }
}
