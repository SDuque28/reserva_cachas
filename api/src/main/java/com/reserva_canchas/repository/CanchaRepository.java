package com.reserva_canchas.repository;

import com.reserva_canchas.entities.Cancha;
import com.reserva_canchas.entities.DiaSemana;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface CanchaRepository extends JpaRepository<Cancha, Long> {

    @Query("""
            SELECT DISTINCT c
            FROM Cancha c
            JOIN FETCH c.sede s
            JOIN FETCH c.tipoCancha tc
            WHERE (:sedeId IS NULL OR s.id = :sedeId)
              AND (:tipoId IS NULL OR tc.id = :tipoId)
              AND (
                  :fecha IS NULL OR EXISTS (
                      SELECT 1
                      FROM Horario h
                      WHERE h.cancha.id = c.id
                        AND h.diaSemana = :diaSemana
                        AND NOT EXISTS (
                            SELECT 1
                            FROM Reserva r
                            WHERE r.cancha.id = c.id
                              AND r.horario.id = h.id
                              AND r.fecha = :fecha
                              AND r.estado = com.reserva_canchas.entities.EstadoReserva.ACTIVA
                        )
                  )
              )
            ORDER BY c.id
            """)
    List<Cancha> findByFilters(
            @Param("sedeId") Long sedeId,
            @Param("tipoId") Long tipoId,
            @Param("fecha") LocalDate fecha,
            @Param("diaSemana") DiaSemana diaSemana
    );
}
