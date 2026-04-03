# Spring Boot JWT Demo con MySQL

## Ejecutar

```bash
./mvnw spring-boot:run
```

En Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

La base de datos debe existir en MySQL con este acceso:

- Base de datos: `reserva_canchas`
- Usuario: `root`
- Contraseña: `12345678`

## Endpoints

### Registrar usuario

`POST /auth/register`

```json
{
  "username": "admin",
  "password": "123456"
}
```

### Login

`POST /auth/login`

```json
{
  "username": "admin",
  "password": "123456"
}
```

Respuesta:

```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9..."
}
```

### Endpoint protegido

`GET /api/test`

Header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

### Endpoint admin

`GET /api/admin`

Requiere que el usuario tenga el rol `ROLE_ADMIN`.
