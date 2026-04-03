package com.reserva_canchas.services.impl;

import com.reserva_canchas.dto.ReservaCreateRequest;
import com.reserva_canchas.dto.ReservaResponse;
import com.reserva_canchas.entities.Cancha;
import com.reserva_canchas.entities.EstadoReserva;
import com.reserva_canchas.entities.Horario;
import com.reserva_canchas.entities.Reserva;
import com.reserva_canchas.entities.Usuario;
import com.reserva_canchas.repository.CanchaRepository;
import com.reserva_canchas.repository.HorarioRepository;
import com.reserva_canchas.repository.ReservaRepository;
import com.reserva_canchas.repository.UsuarioRepository;
import com.reserva_canchas.services.IReservaService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class ReservaServiceImpl implements IReservaService {

    private final ReservaRepository reservaRepository;
    private final CanchaRepository canchaRepository;
    private final HorarioRepository horarioRepository;
    private final UsuarioRepository usuarioRepository;

    @Override
    @Transactional
    public ReservaResponse create(ReservaCreateRequest request) {
        Usuario usuario = getUsuarioAutenticado();

        if (request.getCanchaId() == null || request.getHorarioId() == null || request.getFecha() == null) {
            throw new IllegalArgumentException("canchaId, horarioId and fecha are required");
        }

        Cancha cancha = canchaRepository.findById(request.getCanchaId())
                .orElseThrow(() -> new NoSuchElementException("Cancha not found: " + request.getCanchaId()));
        Horario horario = horarioRepository.findById(request.getHorarioId())
                .orElseThrow(() -> new NoSuchElementException("Horario not found: " + request.getHorarioId()));

        if (!horario.getCancha().getId().equals(cancha.getId())) {
            throw new IllegalArgumentException("El horario no pertenece a la cancha indicada");
        }

        boolean reservaExistente = reservaRepository.existsByCanchaIdAndHorarioIdAndFechaAndEstado(
                request.getCanchaId(),
                request.getHorarioId(),
                request.getFecha(),
                EstadoReserva.ACTIVA
        );
        if (reservaExistente) {
            throw new IllegalArgumentException("Ya existe una reserva activa para esa cancha, horario y fecha");
        }

        Reserva reserva = new Reserva();
        reserva.setUsuario(usuario);
        reserva.setCancha(cancha);
        reserva.setHorario(horario);
        reserva.setFecha(request.getFecha());
        reserva.setEstado(EstadoReserva.ACTIVA);

        return toResponse(reservaRepository.save(reserva));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservaResponse> findMisReservas() {
        Usuario usuario = getUsuarioAutenticado();
        return reservaRepository.findByUsuarioIdWithDetalle(usuario.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public ReservaResponse cancelar(Long id) {
        Usuario usuario = getUsuarioAutenticado();
        Reserva reserva = reservaRepository.findByIdWithDetalle(id)
                .orElseThrow(() -> new NoSuchElementException("Reserva not found: " + id));

        if (!reserva.getUsuario().getId().equals(usuario.getId())) {
            throw new AccessDeniedException("La reserva no pertenece al usuario autenticado");
        }

        reserva.setEstado(EstadoReserva.CANCELADA);
        return toResponse(reservaRepository.save(reserva));
    }

    private Usuario getUsuarioAutenticado() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getName() == null) {
            throw new AuthenticationCredentialsNotFoundException("Usuario no autenticado");
        }

        return usuarioRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new NoSuchElementException("Usuario not found: " + authentication.getName()));
    }

    private ReservaResponse toResponse(Reserva reserva) {
        ReservaResponse response = new ReservaResponse();
        response.setId(reserva.getId());
        response.setCanchaId(reserva.getCancha().getId());
        response.setCanchaNombre(reserva.getCancha().getNombre());
        response.setSedeId(reserva.getCancha().getSede().getId());
        response.setSedeNombre(reserva.getCancha().getSede().getNombre());
        response.setHorarioId(reserva.getHorario().getId());
        response.setHoraInicio(reserva.getHorario().getHoraInicio());
        response.setHoraFin(reserva.getHorario().getHoraFin());
        response.setFecha(reserva.getFecha());
        response.setEstado(reserva.getEstado().name());
        return response;
    }
}
