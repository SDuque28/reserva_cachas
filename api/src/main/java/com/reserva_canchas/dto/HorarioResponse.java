package com.reserva_canchas.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalTime;

@Getter
@Setter
public class HorarioResponse {

    private Long id;
    private LocalTime horaInicio;
    private LocalTime horaFin;
}
