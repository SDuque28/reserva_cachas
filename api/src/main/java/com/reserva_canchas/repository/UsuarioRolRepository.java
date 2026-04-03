package com.reserva_canchas.repository;

import com.reserva_canchas.entities.UsuarioRol;
import com.reserva_canchas.entities.UsuarioRolId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UsuarioRolRepository extends JpaRepository<UsuarioRol, UsuarioRolId> {

    List<UsuarioRol> findByIdUsuarioId(Long usuarioId);

    List<UsuarioRol> findByIdRolId(Long rolId);
}
