package com.reserva_canchas.controllers;

import com.reserva_canchas.dto.SedeResponse;
import com.reserva_canchas.services.ISedeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/sedes")
@RequiredArgsConstructor
public class SedeController {

    private final ISedeService sedeService;

    @GetMapping
    public ResponseEntity<List<SedeResponse>> findAll() {
        return ResponseEntity.ok(sedeService.findAll());
    }
}
