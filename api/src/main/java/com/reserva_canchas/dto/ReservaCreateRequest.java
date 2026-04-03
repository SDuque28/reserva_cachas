package com.reserva_canchas.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class ReservaCreateRequest {

    private Long canchaId;
    private Long horarioId;
    private LocalDate fecha;
}
