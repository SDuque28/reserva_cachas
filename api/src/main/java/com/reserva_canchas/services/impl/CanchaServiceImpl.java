package com.reserva_canchas.services.impl;

import com.reserva_canchas.dto.CanchaResponse;
import com.reserva_canchas.dto.HorarioResponse;
import com.reserva_canchas.entities.Cancha;
import com.reserva_canchas.entities.DiaSemana;
import com.reserva_canchas.entities.Horario;
import com.reserva_canchas.repository.CanchaRepository;
import com.reserva_canchas.repository.HorarioRepository;
import com.reserva_canchas.services.ICanchaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class CanchaServiceImpl implements ICanchaService {

    private final CanchaRepository canchaRepository;
    private final HorarioRepository horarioRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CanchaResponse> findByFilters(Long sedeId, Long tipoId, LocalDate fecha) {
        DiaSemana diaSemana = fecha == null ? null : DiaSemana.from(fecha);
        return canchaRepository.findByFilters(sedeId, tipoId, fecha, diaSemana).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CanchaResponse findById(Long id) {
        Cancha cancha = canchaRepository.findByIdWithSedeAndTipoCancha(id)
                .orElseThrow(() -> new NoSuchElementException("Cancha not found: " + id));

        return toResponse(cancha);
    }

    @Override
    @Transactional(readOnly = true)
    public List<HorarioResponse> findDisponibilidad(Long canchaId, LocalDate fecha) {
        if (!canchaRepository.existsById(canchaId)) {
            throw new NoSuchElementException("Cancha not found: " + canchaId);
        }
        if (fecha == null) {
            throw new IllegalArgumentException("fecha is required");
        }

        return horarioRepository.findDisponiblesByCanchaAndFecha(canchaId, fecha, DiaSemana.from(fecha)).stream()
                .map(this::toResponse)
                .toList();
    }

    private CanchaResponse toResponse(Cancha cancha) {
        CanchaResponse response = new CanchaResponse();
        response.setId(cancha.getId());
        response.setNombre(cancha.getNombre());
        response.setDescripcion(cancha.getDescripcion());
        response.setCapacidad(cancha.getCapacidad());
        response.setImagenUrl(cancha.getImagenUrl());
        response.setSedeId(cancha.getSede().getId());
        response.setSedeNombre(cancha.getSede().getNombre());
        response.setTipoId(cancha.getTipoCancha().getId());
        response.setTipoNombre(cancha.getTipoCancha().getNombre());
        return response;
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
