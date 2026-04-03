CREATE DATABASE reserva_canchas;
USE reserva_canchas;

-- ─────────────────────────────────────────
-- Tabla de usuario
-- ─────────────────────────────────────────
CREATE TABLE usuario (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    username   VARCHAR(100) NOT NULL UNIQUE,
    email      VARCHAR(100) NOT NULL UNIQUE,
    -- Guardar SIEMPRE un hash (bcrypt/argon2), nunca texto plano
    password   VARCHAR(255) NOT NULL,
    activo     BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────
-- Tabla de roles
-- ─────────────────────────────────────────
CREATE TABLE rol (
    id     BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

-- ─────────────────────────────────────────
-- Tabla intermedia usuario_rol (N:N)
-- ─────────────────────────────────────────
CREATE TABLE usuario_rol (
    usuario_id BIGINT NOT NULL,
    rol_id     BIGINT NOT NULL,
    PRIMARY KEY (usuario_id, rol_id),
    CONSTRAINT fk_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_rol     FOREIGN KEY (rol_id)     REFERENCES rol(id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- ─────────────────────────────────────────
-- Tabla de sedes
-- ─────────────────────────────────────────
CREATE TABLE sede (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre     VARCHAR(100) NOT NULL,
    direccion  VARCHAR(255) NOT NULL
);

-- ─────────────────────────────────────────
-- Tabla de tipo cancha
-- ─────────────────────────────────────────
CREATE TABLE tipo_cancha (
    id     BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

-- ─────────────────────────────────────────
-- Tabla de tipo cancha
-- ─────────────────────────────────────────
CREATE TABLE cancha (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre         VARCHAR(100) NOT NULL,
    descripcion    TEXT,
    capacidad      INT NOT NULL,
    imagen_url     VARCHAR(255),

    sede_id        BIGINT NOT NULL,
    tipo_cancha_id BIGINT NOT NULL,

    CONSTRAINT fk_cancha_sede FOREIGN KEY (sede_id) REFERENCES sede(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT fk_cancha_tipo FOREIGN KEY (tipo_cancha_id) REFERENCES tipo_cancha(id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- ─────────────────────────────────────────
-- Tabla de horario
-- ─────────────────────────────────────────
CREATE TABLE horario (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    cancha_id   BIGINT NOT NULL,

    dia_semana  ENUM('LUNES','MARTES','MIERCOLES','JUEVES','VIERNES','SABADO','DOMINGO') NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin    TIME NOT NULL,

    CONSTRAINT fk_horario_cancha FOREIGN KEY (cancha_id) REFERENCES cancha(id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- ─────────────────────────────────────────
-- Tabla de reserva
-- ─────────────────────────────────────────
CREATE TABLE reserva (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,

    usuario_id   BIGINT NOT NULL,
    cancha_id    BIGINT NOT NULL,
    horario_id   BIGINT NOT NULL,

    fecha        DATE NOT NULL,
    estado       ENUM('ACTIVA','CANCELADA') DEFAULT 'ACTIVA',
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_reserva_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT fk_reserva_cancha FOREIGN KEY (cancha_id) REFERENCES cancha(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT fk_reserva_horario FOREIGN KEY (horario_id) REFERENCES horario(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
);

-- ─────────────────────────────────────────
-- Insertar Valores
-- ─────────────────────────────────────────
INSERT INTO sede (nombre, direccion) VALUES
('Sede Centro', 'Calle 10 #20-30'),
('Sede Norte', 'Avenida 50 #80-10');

INSERT INTO tipo_cancha (nombre) VALUES
('FUTBOL'),
('TENIS'),
('BALONCESTO');

INSERT INTO cancha (nombre, descripcion, capacidad, imagen_url, sede_id, tipo_cancha_id) VALUES
('Cancha Futbol 1', 'Cancha sintética', 10, 'https://sportmaster.mx/wp-content/uploads/CANCHA-FUTBOL-7.jpeg', 1, 1),
('Cancha Futbol 2', 'Cancha profesional', 14, 'https://recreasport.com/wp-content/uploads/2017/04/DSCN4094.jpg', 2, 1),
('Cancha Tenis 1', 'Cancha rápida', 4, 'https://civideportes.com.co/wp-content/uploads/2020/08/asphalt-tennis-court-5354328_640.jpg', 1, 2),
('Cancha Basket 1', 'Cancha techada', 10, 'https://phantom-marca-us.unidadeditorial.es/c3897889ecd92dfbf40419426344f549/resize/1200/f/jpg/assets/multimedia/imagenes/2022/03/21/16478751905102.jpg', 2, 3);

INSERT INTO horario (cancha_id, dia_semana, hora_inicio, hora_fin) VALUES
-- Cancha 1
(1, 'LUNES', '08:00:00', '09:00:00'),
(1, 'LUNES', '09:00:00', '10:00:00'),
(1, 'LUNES', '10:00:00', '11:00:00'),

-- Cancha 2
(2, 'LUNES', '08:00:00', '09:00:00'),
(2, 'LUNES', '09:00:00', '10:00:00'),

-- Cancha 3
(3, 'MARTES', '08:00:00', '09:00:00'),
(3, 'MARTES', '09:00:00', '10:00:00'),

-- Cancha 4
(4, 'MIERCOLES', '18:00:00', '19:00:00'),
(4, 'MIERCOLES', '19:00:00', '20:00:00');

-- Reserva existente para bloquear horario
INSERT INTO reserva (usuario_id, cancha_id, horario_id, fecha, estado) VALUES
(1, 1, 1, '2026-04-10', 'ACTIVA'),
(2, 1, 2, '2026-04-10', 'ACTIVA');
