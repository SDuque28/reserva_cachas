package com.reserva_canchas.controllers;

import com.reserva_canchas.dto.HorarioResponse;
import com.reserva_canchas.services.IHorarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/horarios")
@RequiredArgsConstructor
public class HorarioController {

    private final IHorarioService horarioService;

    @GetMapping
    public ResponseEntity<List<HorarioResponse>> findAll(
            @RequestParam(required = false) Long canchaId
    ) {
        return ResponseEntity.ok(horarioService.findAll(canchaId));
    }
}
