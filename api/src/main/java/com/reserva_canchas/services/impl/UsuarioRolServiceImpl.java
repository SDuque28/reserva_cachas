package com.reserva_canchas.services.impl;

import com.reserva_canchas.entities.UsuarioRol;
import com.reserva_canchas.entities.UsuarioRolId;
import com.reserva_canchas.repository.UsuarioRolRepository;
import com.reserva_canchas.services.IUsuarioRolService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioRolServiceImpl implements IUsuarioRolService {

    private final UsuarioRolRepository usuarioRolRepository;

    @Override
    public List<UsuarioRol> findByUsuarioId(Long usuarioId) {
        return usuarioRolRepository.findByIdUsuarioId(usuarioId);
    }

    @Override
    public List<UsuarioRol> findByRolId(Long rolId) {
        return usuarioRolRepository.findByIdRolId(rolId);
    }

    @Override
    public UsuarioRol save(UsuarioRol usuarioRol) {
        UsuarioRolId id = new UsuarioRolId(
                usuarioRol.getUsuario().getId(),
                usuarioRol.getRol().getId()
        );
        usuarioRol.setId(id);
        return usuarioRolRepository.save(usuarioRol);
    }

    @Override
    public boolean delete(UsuarioRolId id) {
        if (!usuarioRolRepository.existsById(id)) return false;
        usuarioRolRepository.deleteById(id);
        return true;
    }
}
