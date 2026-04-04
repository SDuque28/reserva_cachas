package com.reserva_canchas.services.impl;

import com.reserva_canchas.dto.HorarioResponse;
import com.reserva_canchas.entities.Horario;
import com.reserva_canchas.repository.HorarioRepository;
import com.reserva_canchas.services.IHorarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HorarioServiceImpl implements IHorarioService {

    private final HorarioRepository horarioRepository;

    @Override
    @Transactional(readOnly = true)
    public List<HorarioResponse> findAll(Long canchaId) {
        return horarioRepository.findByCanchaId(canchaId).stream()
                .map(this::toResponse)
                .toList();
    }

    private HorarioResponse toResponse(Horario horario) {
        HorarioResponse response = new HorarioResponse();
        response.setId(horario.getId());
        response.setDiaSemana(horario.getDiaSemana());
        response.setHoraInicio(horario.getHoraInicio());
        response.setHoraFin(horario.getHoraFin());
        response.setCanchaId(horario.getCancha().getId());
        return response;
    }
}
