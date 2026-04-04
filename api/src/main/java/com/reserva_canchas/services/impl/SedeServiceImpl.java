package com.reserva_canchas.services.impl;

import com.reserva_canchas.dto.SedeResponse;
import com.reserva_canchas.entities.Sede;
import com.reserva_canchas.repository.SedeRepository;
import com.reserva_canchas.services.ISedeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SedeServiceImpl implements ISedeService {

    private final SedeRepository sedeRepository;

    @Override
    public List<SedeResponse> findAll() {
        return sedeRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    private SedeResponse toResponse(Sede sede) {
        SedeResponse response = new SedeResponse();
        response.setId(sede.getId());
        response.setNombre(sede.getNombre());
        response.setDireccion(sede.getDireccion());
        return response;
    }
}
