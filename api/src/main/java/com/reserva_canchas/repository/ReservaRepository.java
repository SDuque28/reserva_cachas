package com.reserva_canchas.repository;

import com.reserva_canchas.entities.EstadoReserva;
import com.reserva_canchas.entities.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ReservaRepository extends JpaRepository<Reserva, Long> {

    boolean existsByCanchaIdAndHorarioIdAndFechaAndEstado(
            Long canchaId,
            Long horarioId,
            LocalDate fecha,
            EstadoReserva estado
    );

    @Query("""
            SELECT r
            FROM Reserva r
            JOIN FETCH r.cancha c
            JOIN FETCH c.sede
            JOIN FETCH c.tipoCancha
            JOIN FETCH r.horario
            WHERE r.usuario.id = :usuarioId
            ORDER BY r.fecha DESC, r.id DESC
            """)
    List<Reserva> findByUsuarioIdWithDetalle(@Param("usuarioId") Long usuarioId);

    @Query("""
            SELECT r
            FROM Reserva r
            JOIN FETCH r.usuario u
            JOIN FETCH r.cancha c
            JOIN FETCH c.sede
            JOIN FETCH c.tipoCancha
            JOIN FETCH r.horario
            WHERE r.id = :id
            """)
    Optional<Reserva> findByIdWithDetalle(@Param("id") Long id);
}
