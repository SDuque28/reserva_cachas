package com.reserva_canchas.controllers;

import com.reserva_canchas.dto.CanchaResponse;
import com.reserva_canchas.dto.HorarioResponse;
import com.reserva_canchas.services.ICanchaService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/canchas")
@RequiredArgsConstructor
public class CanchaController {

    private final ICanchaService canchaService;

    @GetMapping
    public ResponseEntity<List<CanchaResponse>> findByFilters(
            @RequestParam(required = false) Long sedeId,
            @RequestParam(required = false) Long tipoId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha
    ) {
        return ResponseEntity.ok(canchaService.findByFilters(sedeId, tipoId, fecha));
    }

    @GetMapping("/{id}/disponibilidad")
    public ResponseEntity<List<HorarioResponse>> findDisponibilidad(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha
    ) {
        return ResponseEntity.ok(canchaService.findDisponibilidad(id, fecha));
    }
}
