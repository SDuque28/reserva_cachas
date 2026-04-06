# Reserva Canchas

Sistema de reserva de canchas deportivas con **API REST en Spring Boot** y **aplicación móvil en React Native (Expo)**.

---

##  Tabla de Contenidos

- [Descripción del Proyecto](#-descripción-del-proyecto)
- [Arquitectura General](#-arquitectura-general)
- [Tecnologías](#-tecnologías)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Base de Datos](#-base-de-datos)
- [API Backend (Spring Boot)](#-api-backend-spring-boot)
  - [Requisitos](#requisitos-backend)
  - [Configuración](#configuración-del-backend)
  - [Ejecutar el Backend](#ejecutar-el-backend)
  - [Endpoints de la API](#endpoints-de-la-api)
- [Aplicación Móvil (Expo / React Native)](#-aplicación-móvil-expo--react-native)
  - [Requisitos](#requisitos-móvil)
  - [Configuración](#configuración-de-la-app-móvil)
  - [Ejecutar la App](#ejecutar-la-app)
  - [Pantallas y Navegación](#pantallas-y-navegación)
- [Flujo de Usuario](#-flujo-de-usuario)
- [Seguridad (JWT)](#-seguridad-jwt)
- [Documentos del Proyecto](#-documentos-del-proyecto)

---

##  Descripción del Proyecto

**Reserva Canchas** es una plataforma fullstack que permite a los usuarios:

-  **Registrarse e iniciar sesión** de forma segura con JWT.
-  **Explorar canchas deportivas** (Fútbol, Tenis, Baloncesto) filtradas por sede y tipo.
-  **Consultar disponibilidad** de horarios por cancha y fecha.
-  **Reservar una cancha** en un horario específico.
-  **Cancelar sus propias reservas**.
-  **Ver su perfil** con el nombre de usuario y roles.

---

##  Arquitectura General

```
┌─────────────────────────────────────────────────────┐
│                   Dispositivo Móvil                 │
│          React Native App (Expo Router)             │
│                                                     │
│   Login / Register  →  Canchas  →  Detalle  →       │
│                         Reservas  →  Perfil         │
└───────────────────┬─────────────────────────────────┘
                    │ HTTP REST + JWT Bearer Token
                    ▼
┌─────────────────────────────────────────────────────┐
│              API REST (Spring Boot 3.3.5)           │
│                                                     │
│  /auth/**   →  AuthController  (público)            │
│  /canchas/** →  CanchaController  (autenticado)     │
│  /reservas/** → ReservaController (autenticado)     │
│  /horarios/** → HorarioController (autenticado)     │
│  /sedes/**  →  SedeController  (autenticado)        │
│  /tipos-cancha/ → TipoCanchaController (autenticado)│
└───────────────────┬─────────────────────────────────┘
                    │ JPA / Hibernate
                    ▼
┌─────────────────────────────────────────────────────┐
│                  MySQL 8+                           │
│   usuario · rol · usuario_rol · sede · tipo_cancha  │
│   cancha · horario · reserva                        │
└─────────────────────────────────────────────────────┘
```

---

##  Tecnologías

### Backend
| Tecnología | Versión | Rol |
|---|---|---|
| Java | 21 | Lenguaje principal |
| Spring Boot | 3.3.5 | Framework web |
| Spring Security | incluido | Autenticación y autorización |
| Spring Data JPA | incluido | ORM / Acceso a datos |
| jjwt (JJWT) | 0.12.6 | Generación y validación JWT |
| Lombok | incluido | Reducción de boilerplate |
| MySQL Connector/J | incluido | Controlador de base de datos |
| Maven | 3.x | Gestión de dependencias |

### Móvil
| Tecnología | Versión | Rol |
|---|---|---|
| React Native | 0.81.5 | Framework móvil |
| Expo | ~54.0.0 | Runtime y herramientas |
| Expo Router | ~6.0.23 | Navegación basada en archivos |
| TypeScript | ~5.9.2 | Tipado estático |
| Axios | ^1.14.0 | Cliente HTTP |
| expo-secure-store | ~15.0.8 | Almacenamiento seguro del JWT |
| AsyncStorage | 2.2.0 | Almacenamiento local |
| expo-linear-gradient | ~15.0.8 | Gradientes visuales |

### Base de Datos
| Tecnología | Rol |
|---|---|
| MySQL 8+ | Motor de base de datos relacional |

---

##  Estructura del Proyecto

```
reserva_cachas/
├── api/                            # Backend Spring Boot
│   ├── src/main/java/com/reserva_canchas/
│   │   ├── controllers/            # Controladores REST
│   │   │   ├── AuthController.java
│   │   │   ├── CanchaController.java
│   │   │   ├── ReservaController.java
│   │   │   ├── HorarioController.java
│   │   │   ├── SedeController.java
│   │   │   ├── TipoCanchaController.java
│   │   │   ├── RolController.java
│   │   │   ├── UsuarioRolController.java
│   │   │   └── GlobalExceptionHandler.java
│   │   ├── dto/                    # Objetos de transferencia de datos
│   │   │   ├── AuthResponse.java
│   │   │   ├── LoginRequest.java
│   │   │   ├── RegisterRequest.java
│   │   │   ├── CanchaResponse.java
│   │   │   ├── HorarioResponse.java
│   │   │   ├── ReservaCreateRequest.java
│   │   │   ├── ReservaResponse.java
│   │   │   ├── SedeResponse.java
│   │   │   ├── TipoCanchaResponse.java
│   │   │   └── ...
│   │   ├── entities/               # Entidades JPA
│   │   │   ├── Usuario.java
│   │   │   ├── Rol.java
│   │   │   ├── UsuarioRol.java
│   │   │   ├── Sede.java
│   │   │   ├── TipoCancha.java
│   │   │   ├── Cancha.java
│   │   │   ├── Horario.java
│   │   │   ├── Reserva.java
│   │   │   ├── DiaSemana.java      # Enum: LUNES - DOMINGO
│   │   │   └── EstadoReserva.java  # Enum: ACTIVA, CANCELADA
│   │   ├── repository/             # Repositorios Spring Data
│   │   ├── security/               # Configuración de seguridad JWT
│   │   │   ├── JwtUtil.java        # Generación/validación de tokens
│   │   │   ├── JwtFilter.java      # Filtro HTTP para interceptar tokens
│   │   │   └── SecurityConfig.java # Reglas de acceso y cadena de filtros
│   │   ├── services/               # Interfaces e implementaciones de negocio
│   │   │   ├── IAuthService.java
│   │   │   ├── ICanchaService.java
│   │   │   ├── IReservaService.java
│   │   │   └── impl/               # Implementaciones concretas
│   │   └── reservaCanchas.java     # Clase principal Spring Boot
│   ├── src/main/resources/
│   │   ├── application.properties  # Configuración de la app
│   │   └── database.sql            # Script DDL + datos de ejemplo
│   └── pom.xml
│
├── mobile/                         # Frontend React Native (Expo)
│   ├── app/
│   │   ├── _layout.tsx             # Layout raíz + guard de autenticación
│   │   ├── login.tsx               # Pantalla de inicio de sesión
│   │   ├── register.tsx            # Pantalla de registro
│   │   └── (tabs)/                 # Sección autenticada (tabs inferiores)
│   │       ├── _layout.tsx         # Configuración de tabs
│   │       ├── canchas/
│   │       │   ├── index.tsx       # Lista de canchas + filtros
│   │       │   └── [id].tsx        # Detalle de cancha + reserva
│   │       ├── reservas/
│   │       │   ├── index.tsx       # Mis reservas
│   │       │   └── [id].tsx        # Detalle de reserva
│   │       └── perfil.tsx          # Perfil del usuario
│   ├── context/
│   │   └── AuthContext.tsx         # Contexto global de autenticación
│   ├── services/
│   │   ├── apiClient.ts            # Instancia Axios + interceptores JWT
│   │   ├── auth.service.ts         # Login / Registro
│   │   ├── canchas.service.ts      # CRUD de canchas y horarios
│   │   ├── reservas.service.ts     # CRUD de reservas
│   │   ├── sedes.service.ts        # Listado de sedes
│   │   ├── tipos.service.ts        # Listado de tipos de cancha
│   │   └── types.ts                # Interfaces TypeScript compartidas
│   ├── hooks/
│   │   └── useAuth.ts              # Hook para consumir AuthContext
│   ├── app.json                    # Config de la app Expo
│   ├── babel.config.js
│   ├── metro.config.js
│   └── package.json
│
└── documents/
    ├── Diagrama.pu                 # Diagrama entidad-relación (PlantUML)
    ├── Diagrama.png                # Diagrama ER exportado
    └── RUTAS.md                   # Documentación de la lógica de negocio
```

---

##  Base de Datos

### Diagrama Entidad-Relación

```
usuario ──< usuario_rol >── rol

sede ──< cancha >── tipo_cancha
         │
         └──< horario

usuario ──< reserva >── cancha
reserva  ──────────>── horario
```

### Tablas Principales

| Tabla | Descripción |
|---|---|
| `usuario` | Usuarios registrados en el sistema |
| `rol` | Roles del sistema (ej. ROLE_USER, ROLE_ADMIN) |
| `usuario_rol` | Tabla intermedia N:N entre usuario y rol |
| `sede` | Sedes/ubicaciones físicas (ej. Sede Centro, Sede Norte) |
| `tipo_cancha` | Tipos de cancha: FUTBOL, TENIS, BALONCESTO |
| `cancha` | Canchas disponibles con imagen, capacidad y sede |
| `horario` | Horarios disponibles por cancha (día + hora inicio/fin) |
| `reserva` | Reservas realizadas por los usuarios |

### Script SQL

El archivo `api/src/main/resources/database.sql` contiene:
- Creación de la base de datos y todas las tablas.
- Datos de ejemplo: 2 sedes, 3 tipos de cancha, 4 canchas, 9 horarios y 2 reservas iniciales.

Para importarlo:
```sql
-- En MySQL Workbench o consola MySQL:
source /ruta/al/proyecto/api/src/main/resources/database.sql;
```

---

## API Backend (Spring Boot)

### Requisitos (Backend)

- **Java 21** o superior
- **Maven 3.6+** (o usar el wrapper `mvnw` incluido)
- **MySQL 8+** corriendo localmente

### Configuración del Backend

Edita el archivo `api/src/main/resources/application.properties`:

```properties
# Conexión a la base de datos
spring.datasource.url=jdbc:mysql://localhost:3306/reserva_canchas
spring.datasource.username=root
spring.datasource.password=TU_CONTRASEÑA

# JPA / Hibernate — no recrea la BD automáticamente
spring.jpa.hibernate.ddl-auto=none

# JWT
jwt.secret=0123456789abcdef0123456789abcdef   # Cambia por una clave segura
jwt.expiration=3600000                          # 1 hora en milisegundos
```

### Ejecutar el Backend

```bash
# Desde la carpeta api/
cd api

# Con el wrapper de Maven (recomendado, no requiere Maven instalado)
./mvnw spring-boot:run        # Linux / macOS
mvnw.cmd spring-boot:run      # Windows

# O si tienes Maven instalado globalmente
mvn spring-boot:run
```

El servidor arrancará en `http://localhost:8080`.

### Endpoints de la API

#### Autenticación (Público)

| Método | Ruta | Descripción | Body |
|---|---|---|---|
| `POST` | `/auth/register` | Registrar nuevo usuario | `{ "username", "email", "password" }` |
| `POST` | `/auth/login` | Iniciar sesión | `{ "username", "password" }` |

**Respuesta de autenticación:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "username": "usuario1",
  "email": "usuario1@mail.com",
  "roles": ["ROLE_USER"]
}
```

---

#### Canchas (Requiere token JWT)

| Método | Ruta | Descripción | Parámetros |
|---|---|---|---|
| `GET` | `/canchas` | Listar canchas | `?sedeId=1&tipoId=2&fecha=2026-04-10` (opcionales) |
| `GET` | `/canchas/{id}` | Detalle de una cancha | — |
| `GET` | `/canchas/{id}/disponibilidad` | Horarios disponibles | `?fecha=2026-04-10` (requerido) |

---

####  Reservas (Requiere token JWT)

| Método | Ruta | Descripción | Body |
|---|---|---|---|
| `POST` | `/reservas` | Crear una reserva | `{ "canchaId", "horarioId", "fecha" }` |
| `GET` | `/reservas/mis-reservas` | Ver mis reservas | — |
| `DELETE` | `/reservas/{id}` | Cancelar una reserva | — |

---

####  Datos Auxiliares (Requiere token JWT)

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/sedes` | Listar todas las sedes |
| `GET` | `/tipos-cancha` | Listar tipos de cancha |
| `GET` | `/horarios` | Listar horarios (filtrable por `?canchaId=1`) |

---

####  Roles y Administración (Requiere token JWT)

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/roles` | Listar roles |
| `POST` | `/roles` | Crear rol |
| `PUT` | `/roles/{id}` | Actualizar rol |
| `DELETE` | `/roles/{id}` | Eliminar rol |
| `GET` | `/usuario-roles` | Listar asignaciones usuario-rol |
| `POST` | `/usuario-roles` | Asignar rol a usuario |
| `DELETE` | `/usuario-roles/{usuarioId}/{rolId}` | Quitar rol a usuario |

---

#### Uso del Token en peticiones

Todos los endpoints protegidos requieren el header:
```
Authorization: Bearer <TOKEN_JWT>
```

---

## Aplicación Móvil (Expo / React Native)

### Requisitos (Móvil)

- **Node.js 18+**
- **npm 9+** o **yarn**
- **Expo Go** instalado en tu teléfono (Android/iOS) o un emulador Android / simulador iOS

### Configuración de la App Móvil

1. Crea el archivo de variables de entorno en `mobile/`:

```bash
# mobile/.env
EXPO_PUBLIC_API_URL=http://TU_IP_LOCAL:8080
```

2. Instala las dependencias:

```bash
cd mobile
npm install
```

### Ejecutar la App

```bash
# Desde la carpeta mobile/
cd mobile

# Modo genérico (muestra QR para Expo Go)
npm start

# Abrir directamente en Android
npm run android

# Abrir directamente en iOS (solo macOS)
npm run ios

# Abrir en navegador web
npm run web
```

Escanea el QR con la app **Expo Go** en tu teléfono.

---

### Pantallas y Navegación

```
App
├── /login          → Inicio de sesión
├── /register       → Registro de cuenta
└── /(tabs)/        → Zona autenticada (barra de tabs inferior)
    ├── canchas/
    │   ├── (index) → Lista de canchas con filtros por sede y tipo
    │   └── [id]    → Detalle de cancha + selector de fecha + reserva
    ├── reservas/
    │   ├── (index) → Mis reservas activas y canceladas
    │   └── [id]    → Detalle de una reserva (info completa)
    └── perfil      → Datos del usuario + cerrar sesión
```

#### Pantalla de Login

- Campos: **Usuario** y **Contraseña**.
- Validación en cliente antes de enviar.
- Redirige a `/canchas` al iniciar sesión correctamente.
- Enlace para ir al registro.

#### Pantalla de Registro

- Campos: **Nombre**, **Email** y **Contraseña**.
- Tras registro exitoso inicia sesión automáticamente.

#### Pantalla de Canchas (Lista)

- Muestra todas las canchas con imagen, nombre, tipo y sede.
- **Filtros** horizontales por sede y tipo de cancha.
- Toca una cancha para ver su detalle.

#### Pantalla de Detalle de Cancha

- Imagen/placeholder de la cancha, descripción y capacidad.
- **Selector de fecha** para consultar disponibilidad.
- Lista de **horarios disponibles** para la fecha seleccionada.
- Botón **Reservar** para cada horario disponible con confirmación.

#### Pantalla de Mis Reservas

- Lista todas las reservas del usuario autenticado.
- Muestra: cancha, sede, fecha, horario y estado (ACTIVA / CANCELADA).
- Permite **cancelar** una reserva con confirmación.

#### Pantalla de Perfil

- Nombre de usuario y email.
- Botón de **Cerrar sesión** que limpia el token del almacenamiento seguro.

---

## Flujo de Usuario

```
1. El usuario abre la app
        │
        ▼
2. ¿Hay token guardado? ──No──→ Pantalla de Login / Registro
        │ Sí
        ▼
3. Pantalla de Canchas (lista)
        │
        ▼
4. Selecciona una cancha → Ve disponibilidad
        │
        ▼
5. Elige fecha y horario → Confirma reserva
        │
        ▼
6. Reserva creada → Puede verla en "Mis Reservas"
        │
        ▼
7. Si la cancela → Estado cambia a "CANCELADA"
```

---

## Seguridad (JWT)

El sistema usa **JSON Web Tokens (JWT)** con el algoritmo HMAC-SHA256:

| Componente | Descripción |
|---|---|
| `JwtUtil.java` | Genera y valida tokens con la clave secreta definida en `application.properties` |
| `JwtFilter.java` | Intercepta cada request HTTP, extrae el token del header `Authorization` y carga el usuario en el contexto de seguridad |
| `SecurityConfig.java` | Define qué rutas son públicas (`/auth/**`) y cuáles requieren autenticación |
| `BCryptPasswordEncoder` | Las contraseñas se guardan con hash BCrypt, nunca en texto plano |
| `expo-secure-store` | En la app móvil, el JWT se almacena en el llavero seguro del dispositivo (Keychain en iOS, Keystore en Android) |

**Flujo de autenticación:**
```
App  →  POST /auth/login { username, password }
     ←  { token: "eyJ..." }

App guarda token en SecureStore

App  →  GET /canchas  [Authorization: Bearer eyJ...]
     ←  [ { id, nombre, ... } ]
```

---

## Documentos del Proyecto

| Archivo | Descripción |
|---|---|
| `documents/Diagrama.pu` | Diagrama entidad-relación en formato PlantUML |
| `documents/Diagrama.png` | Imagen exportada del diagrama ER |
| `documents/RUTAS.md` | Especificación de la lógica de negocio pendiente para cada endpoint |
| `api/src/main/resources/database.sql` | Script completo de creación de tablas e inserción de datos de prueba |

---

*Proyecto académico – Reserva de Canchas Deportivas*
