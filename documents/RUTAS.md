# LÓGICA DE NEGOCIO (EN PROCESO / COMPLETAR)

## Canchas

### GET /canchas
- [ ] Listar todas las canchas
- [ ] Filtro por sedeId
- [ ] Filtro por tipoId
- [ ] Filtro por fecha (disponibilidad)

---

## Disponibilidad

### GET /canchas/{id}/disponibilidad
- [ ] Obtener horarios de la cancha
- [ ] Excluir horarios reservados
- [ ] Retornar solo disponibles

---

## Reservas

### POST /reservas
- [ ] Validar usuario autenticado
- [ ] Validar que el horario pertenece a la cancha
- [ ] Validar que no exista reserva duplicada
- [ ] Crear reserva

### GET /reservas/mis-reservas
- [ ] Obtener reservas del usuario autenticado
- [ ] Incluir:
  - cancha
  - sede
  - horario
  - fecha

### DELETE /reservas/{id}
- [ ] Validar propietario
- [ ] Cambiar estado a CANCELADA

---

## Datos auxiliares

### GET /sedes
- [ ] Listar sedes

### GET /tipos-cancha
- [ ] Listar tipos de cancha

---

