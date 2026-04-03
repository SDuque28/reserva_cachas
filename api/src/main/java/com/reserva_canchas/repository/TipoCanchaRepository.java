package com.reserva_canchas.repository;

import com.reserva_canchas.entities.TipoCancha;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TipoCanchaRepository extends JpaRepository<TipoCancha, Long> {
}
