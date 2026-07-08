-- =============================================================
-- Script de Migración: Subsistema de Asistencia
-- DB: scrum_eval
-- =============================================================

USE scrum_eval;

-- =============================================================
-- 1. EXTENSIONES A users
-- =============================================================
ALTER TABLE users
  ADD COLUMN legacy_id INT NULL,
  ADD COLUMN dni VARCHAR(20) NULL,
  ADD COLUMN telefono VARCHAR(60) NULL,
  ADD COLUMN fecha_nacimiento DATE NULL,
  ADD COLUMN direccion VARCHAR(255) NULL,
  ADD COLUMN cuil VARCHAR(50) NULL,
  ADD COLUMN nacionalidad VARCHAR(200) NULL;

-- =============================================================
-- 2. ROLES
-- =============================================================
UPDATE roles SET name = 'Admin' WHERE id = 1;
INSERT IGNORE INTO roles (id, name) VALUES (3, 'Docente'), (4, 'Preceptor'), (5, 'Referente');

-- =============================================================
-- 3. TABLAS asis_*
-- =============================================================

-- 3.1 Especialidades
CREATE TABLE IF NOT EXISTS asis_especialidades (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  activo TINYINT(1) DEFAULT 1
);

-- 3.2 Cursos
CREATE TABLE IF NOT EXISTS asis_cursos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT NULL,
  anio INT NOT NULL,
  especialidad_id INT NOT NULL,
  division VARCHAR(10) NOT NULL,
  turno VARCHAR(40) NOT NULL,
  activo TINYINT(1) DEFAULT 1,
  FOREIGN KEY (especialidad_id) REFERENCES asis_especialidades(id)
);

-- 3.3 Docentes por curso (M:N)
CREATE TABLE IF NOT EXISTS asis_docentes_curso (
  id INT AUTO_INCREMENT PRIMARY KEY,
  curso_id INT NOT NULL,
  user_id INT NOT NULL,
  rol ENUM('docente', 'preceptor') NOT NULL,
  FOREIGN KEY (curso_id) REFERENCES asis_cursos(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_preceptor_curso (curso_id, rol)
);

-- 3.4 Horarios
CREATE TABLE IF NOT EXISTS asis_horarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  curso_id INT NOT NULL,
  dia_semana TINYINT NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  hs_reloj DECIMAL(5,2) NOT NULL,
  hs_catedra DECIMAL(5,2) NOT NULL,
  FOREIGN KEY (curso_id) REFERENCES asis_cursos(id) ON DELETE CASCADE
);

-- 3.5 Alumnos por curso
CREATE TABLE IF NOT EXISTS asis_alumnos_curso (
  id INT AUTO_INCREMENT PRIMARY KEY,
  curso_id INT NOT NULL,
  user_id INT NOT NULL,
  fecha_inscripcion DATE NOT NULL DEFAULT (CURDATE()),
  activo TINYINT(1) DEFAULT 1,
  FOREIGN KEY (curso_id) REFERENCES asis_cursos(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_alumno_curso (curso_id, user_id)
);

-- 3.6 Registros de asistencia (tabla principal)
CREATE TABLE IF NOT EXISTS asis_registros (
  id INT AUTO_INCREMENT PRIMARY KEY,
  alumno_curso_id INT NOT NULL,
  fecha DATE NOT NULL,
  estado ENUM('presente', 'ausente', 'tardia', 'retiro_anticipado') NOT NULL,
  hora_ingreso TIME NULL,
  hora_egreso TIME NULL,
  correccion_manual TINYINT(1) DEFAULT 0,
  created_by INT NOT NULL,
  justificacion VARCHAR(255) NULL,
  FOREIGN KEY (alumno_curso_id) REFERENCES asis_alumnos_curso(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id),
  UNIQUE KEY unique_asistencia_dia (alumno_curso_id, fecha)
);

-- 3.7 Faltas ponderadas
CREATE TABLE IF NOT EXISTS asis_faltas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  alumno_curso_id INT NOT NULL,
  fecha DATE NOT NULL,
  tipo_falta DECIMAL(3,2) NOT NULL,
  motivo VARCHAR(255) NULL,
  FOREIGN KEY (alumno_curso_id) REFERENCES asis_alumnos_curso(id) ON DELETE CASCADE,
  UNIQUE KEY unique_falta (alumno_curso_id, fecha)
);

-- 3.8 Eventos especiales
CREATE TABLE IF NOT EXISTS asis_eventos_especiales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  curso_id INT NOT NULL,
  fecha DATE NOT NULL,
  descripcion VARCHAR(255) NOT NULL,
  horas_reloj DECIMAL(5,2) NOT NULL,
  horas_catedra DECIMAL(5,2) NOT NULL,
  FOREIGN KEY (curso_id) REFERENCES asis_cursos(id) ON DELETE CASCADE
);

-- 3.9 Ausencias del docente
CREATE TABLE IF NOT EXISTS asis_ausencias_docente (
  id INT AUTO_INCREMENT PRIMARY KEY,
  curso_id INT NOT NULL,
  fecha DATE NOT NULL,
  motivo VARCHAR(255) NULL,
  FOREIGN KEY (curso_id) REFERENCES asis_cursos(id) ON DELETE CASCADE,
  UNIQUE KEY unique_ausencia (curso_id, fecha)
);

-- 3.10 Días no laborables
CREATE TABLE IF NOT EXISTS asis_dias_no_laborables (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fecha DATE NOT NULL,
  motivo VARCHAR(255) NOT NULL,
  tipo VARCHAR(50) DEFAULT 'feriado',
  aplica_todos TINYINT(1) DEFAULT 1,
  curso_id INT NULL,
  FOREIGN KEY (curso_id) REFERENCES asis_cursos(id) ON DELETE CASCADE,
  UNIQUE KEY unique_dia_no_laborable (fecha, curso_id)
);

-- 3.11 Parámetros del sistema
CREATE TABLE IF NOT EXISTS asis_parametros (
  clave VARCHAR(50) PRIMARY KEY,
  valor VARCHAR(255) NOT NULL
);

INSERT IGNORE INTO asis_parametros (clave, valor) VALUES
  ('minimo_anual_hs_catedra', '216'),
  ('catedra_minutos', '40'),
  ('falta_completa', '1.00'),
  ('falta_tardia', '0.50'),
  ('falta_retiro', '0.25');

-- 3.12 Notificaciones
CREATE TABLE IF NOT EXISTS asis_notificaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  titulo VARCHAR(100) NOT NULL,
  mensaje TEXT NOT NULL,
  tipo ENUM('alerta', 'info', 'advertencia') DEFAULT 'info',
  leida TINYINT(1) DEFAULT 0,
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3.13 Configuración notificaciones por curso
CREATE TABLE IF NOT EXISTS asis_notificaciones_config (
  id INT AUTO_INCREMENT PRIMARY KEY,
  curso_id INT NOT NULL,
  email_destinatarios JSON NOT NULL,
  hora_envio TIME NULL,
  activo TINYINT(1) DEFAULT 0,
  FOREIGN KEY (curso_id) REFERENCES asis_cursos(id) ON DELETE CASCADE
);

-- 3.14 Códigos de matriculación
CREATE TABLE IF NOT EXISTS asis_matriculacion_codigos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  curso_id INT NOT NULL,
  codigo VARCHAR(20) NOT NULL UNIQUE,
  activo TINYINT(1) DEFAULT 1,
  usos_maximos INT DEFAULT 0,
  usos_actuales INT DEFAULT 0,
  FOREIGN KEY (curso_id) REFERENCES asis_cursos(id) ON DELETE CASCADE
);

-- 3.15 Log de importación legacy
CREATE TABLE IF NOT EXISTS asis_import_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fecha_importacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  tabla_origen VARCHAR(50),
  registros_importados INT,
  registros_omitidos INT
);
