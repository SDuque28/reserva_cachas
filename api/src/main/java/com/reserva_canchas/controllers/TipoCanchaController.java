package com.reserva_canchas.controllers;

import com.reserva_canchas.dto.TipoCanchaResponse;
import com.reserva_canchas.services.ITipoCanchaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/tipos-cancha")
@RequiredArgsConstructor
public class TipoCanchaController {

    private final ITipoCanchaService tipoCanchaService;

    @GetMapping
    public ResponseEntity<List<TipoCanchaResponse>> findAll() {
        return ResponseEntity.ok(tipoCanchaService.findAll());
    }
}
