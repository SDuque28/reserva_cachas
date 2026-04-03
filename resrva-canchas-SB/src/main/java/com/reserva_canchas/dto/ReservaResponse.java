package com.reserva_canchas.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
public class ReservaResponse {

    private Long id;
    private Long canchaId;
    private String canchaNombre;
    private Long sedeId;
    private String sedeNombre;
    private Long horarioId;
    private LocalTime horaInicio;
    private LocalTime horaFin;
    private LocalDate fecha;
    private String estado;
}
