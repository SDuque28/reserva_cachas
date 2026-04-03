package com.reserva_canchas.controllers;

import com.reserva_canchas.dto.ReservaCreateRequest;
import com.reserva_canchas.dto.ReservaResponse;
import com.reserva_canchas.services.IReservaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/reservas")
@RequiredArgsConstructor
public class ReservaController {

    private final IReservaService reservaService;

    @PostMapping
    public ResponseEntity<ReservaResponse> create(@RequestBody ReservaCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reservaService.create(request));
    }

    @GetMapping("/mis-reservas")
    public ResponseEntity<List<ReservaResponse>> findMisReservas() {
        return ResponseEntity.ok(reservaService.findMisReservas());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ReservaResponse> cancelar(@PathVariable Long id) {
        return ResponseEntity.ok(reservaService.cancelar(id));
    }
}
