package com.reserva_canchas.services;

import com.reserva_canchas.entities.UsuarioRol;
import com.reserva_canchas.entities.UsuarioRolId;

import java.util.List;

public interface IUsuarioRolService {

    List<UsuarioRol> findByUsuarioId(Long usuarioId);

    List<UsuarioRol> findByRolId(Long rolId);

    UsuarioRol save(UsuarioRol usuarioRol);

    boolean delete(UsuarioRolId id);
}
