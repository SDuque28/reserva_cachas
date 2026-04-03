package com.reserva_canchas.repository;

import com.reserva_canchas.entities.DiaSemana;
import com.reserva_canchas.entities.Horario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface HorarioRepository extends JpaRepository<Horario, Long> {

    @Query("""
            SELECT h
            FROM Horario h
            WHERE h.cancha.id = :canchaId
              AND h.diaSemana = :diaSemana
              AND NOT EXISTS (
                  SELECT 1
                  FROM Reserva r
                  WHERE r.cancha.id = :canchaId
                    AND r.horario.id = h.id
                    AND r.fecha = :fecha
                    AND r.estado = com.reserva_canchas.entities.EstadoReserva.ACTIVA
              )
            ORDER BY h.horaInicio
            """)
    List<Horario> findDisponiblesByCanchaAndFecha(
            @Param("canchaId") Long canchaId,
            @Param("fecha") LocalDate fecha,
            @Param("diaSemana") DiaSemana diaSemana
    );
}
