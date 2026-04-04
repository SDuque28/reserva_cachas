package com.reserva_canchas.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CanchaResponse {

    private Long id;
    private String nombre;
    private String descripcion;
    private Integer capacidad;
    private String imagenUrl;
    private Long sedeId;
    private String sedeNombre;
    private Long tipoId;
    private String tipoNombre;
}
