CREATE DATABASE IF NOT EXISTS scrum_eval;
USE scrum_eval;

CREATE TABLE IF NOT EXISTS settings (
    id INT PRIMARY KEY,
    key_name VARCHAR(50) UNIQUE,
    val TINYINT(1)
);

INSERT IGNORE INTO settings (id, key_name, val) VALUES (1, 'evaluations_enabled', 1);

-- Tabla de Roles
CREATE TABLE IF NOT EXISTS roles (
    id INT PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

INSERT IGNORE INTO roles (id, name) VALUES (1, 'Admin'), (2, 'Alumno'), (3, 'Docente'), (4, 'Preceptor'), (5, 'Referente');

-- Tabla de Equipos
CREATE TABLE IF NOT EXISTS teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- Tabla de Usuarios (Con columnas adicionales integradas)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    external_id INT,
    username VARCHAR(100),
    email VARCHAR(150) UNIQUE NOT NULL,
    password_md5 VARCHAR(32) NOT NULL,
    role_id INT DEFAULT 2,
    team_id INT,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    year_div VARCHAR(50),
    school_year VARCHAR(50),
    legacy_id INT,
    dni VARCHAR(20),
    telefono VARCHAR(60),
    telefono_alternativo VARCHAR(60),
    fecha_nacimiento DATE,
    direccion VARCHAR(255),
    cuil VARCHAR(50),
    nacionalidad VARCHAR(200),
    genero VARCHAR(20),
    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (team_id) REFERENCES teams(id)
);

-- Tabla de Periodos de Evaluación (Bisemanales)
CREATE TABLE IF NOT EXISTS evaluation_periods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    label VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    bimestre INT NOT NULL,
    is_active TINYINT(1) DEFAULT 0
);

INSERT IGNORE INTO evaluation_periods (label, start_date, end_date, bimestre) VALUES
('Marzo Semana 1-2', '2026-03-01', '2026-03-15', 1),
('Marzo Semana 3-4', '2026-03-16', '2026-03-31', 1),
('Abril Semana 1-2', '2026-04-01', '2026-04-15', 1),
('Abril Semana 3-4', '2026-04-16', '2026-04-30', 1),
('Mayo Semana 1-2', '2026-05-01', '2026-05-15', 2),
('Mayo Semana 3-4', '2026-05-16', '2026-05-31', 2),
('Junio Semana 1-2', '2026-06-01', '2026-06-15', 2),
('Junio Semana 3-4', '2026-06-16', '2026-06-30', 2),
('Julio Semana 1-2', '2026-07-01', '2026-07-15', 3),
('Julio Semana 3-4', '2026-07-16', '2026-07-31', 3),
('Agosto Semana 1-2', '2026-08-01', '2026-08-15', 3),
('Agosto Semana 3-4', '2026-08-16', '2026-08-31', 3),
('Septiembre Semana 1-2', '2026-09-01', '2026-09-15', 3),
('Septiembre Semana 3-4', '2026-09-16', '2026-09-30', 3),
('Octubre Semana 1-2', '2026-10-01', '2026-10-15', 4),
('Octubre Semana 3-4', '2026-10-16', '2026-10-31', 4),
('Noviembre Semana 1-2', '2026-11-01', '2026-11-15', 4),
('Noviembre Semana 3-4', '2026-11-16', '2026-11-30', 4);

-- Tabla de Evaluaciones (Pares)
CREATE TABLE IF NOT EXISTS evaluations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    period_id INT NOT NULL,
    evaluator_id INT NOT NULL,
    evaluatee_id INT NOT NULL,
    score_teamwork DECIMAL(3,2) NOT NULL,
    score_development DECIMAL(3,2) NOT NULL,
    score_class_work DECIMAL(3,2) NOT NULL,
    is_sm_eval TINYINT(1) DEFAULT 0,
    score_sm_leadership DECIMAL(3,2) DEFAULT NULL,
    score_sm_facilitation DECIMAL(3,2) DEFAULT NULL,
    score_sm_support DECIMAL(3,2) DEFAULT NULL,
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (period_id) REFERENCES evaluation_periods(id),
    FOREIGN KEY (evaluator_id) REFERENCES users(id),
    FOREIGN KEY (evaluatee_id) REFERENCES users(id)
);

-- Tabla para Scrum Masters
CREATE TABLE IF NOT EXISTS scrum_masters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_id INT NOT NULL,
    user_id INT NOT NULL,
    bimestre INT NOT NULL,
    FOREIGN KEY (team_id) REFERENCES teams(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tabla para Evaluación Docente
CREATE TABLE IF NOT EXISTS teacher_evaluations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    period_id INT NOT NULL,
    user_id INT NOT NULL,
    score DECIMAL(3,1) NOT NULL,
    comments VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY (period_id, user_id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tabla para opciones académicas
CREATE TABLE IF NOT EXISTS academic_options (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('school_year', 'year_div') NOT NULL,
    value VARCHAR(50) NOT NULL
);

INSERT IGNORE INTO academic_options (type, value) VALUES 
('school_year', '2026'),
('year_div', '6°1'),
('year_div', '6°2');

-- Tabla de Tareas de Jira
CREATE TABLE IF NOT EXISTS jira_issues (
    id INT AUTO_INCREMENT PRIMARY KEY,
    issue_key VARCHAR(20) UNIQUE,
    summary TEXT,
    issue_type VARCHAR(50),
    status VARCHAR(50),
    priority VARCHAR(50),
    assignee_id INT,
    created_at DATETIME,
    updated_at DATETIME,
    resolved_at DATETIME,
    due_date DATETIME,
    original_estimate DECIMAL(10,2),
    time_spent DECIMAL(10,2),
    vulnerability_count INT DEFAULT 0,
    cell_id INT,
    FOREIGN KEY (assignee_id) REFERENCES users(id)
);

-- Tabla de Calificaciones Finales
CREATE TABLE IF NOT EXISTS final_grades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    cell_id INT,
    period_id INT,
    individual_score DECIMAL(5,2),
    group_score DECIMAL(5,2),
    role_score DECIMAL(5,2),
    final_score DECIMAL(5,2),
    metrics_json JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY (user_id, cell_id, period_id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Extensiones para Asistencia
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS legacy_id INT NULL,
  ADD COLUMN IF NOT EXISTS dni VARCHAR(20) NULL,
  ADD COLUMN IF NOT EXISTS telefono VARCHAR(60) NULL,
  ADD COLUMN IF NOT EXISTS fecha_nacimiento DATE NULL,
  ADD COLUMN IF NOT EXISTS direccion VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS cuil VARCHAR(50) NULL,
  ADD COLUMN IF NOT EXISTS nacionalidad VARCHAR(200) NULL;

-- Tablas de Asistencia
CREATE TABLE IF NOT EXISTS asis_especialidades (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  activo TINYINT(1) DEFAULT 1
);

CREATE TABLE IF NOT EXISTS asis_cursos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT NULL,
  anio INT NOT NULL,
  especialidad_id INT NOT NULL,
  division VARCHAR(10) NOT NULL,
  turno VARCHAR(40) NOT NULL,
  ciclo_lectivo INT NOT NULL,
  codigo_automatricula VARCHAR(20) UNIQUE,
  legacy_id INT,
  activo TINYINT(1) DEFAULT 1,
  FOREIGN KEY (especialidad_id) REFERENCES asis_especialidades(id)
);

CREATE TABLE IF NOT EXISTS asis_docentes_curso (
  id INT AUTO_INCREMENT PRIMARY KEY,
  curso_id INT NOT NULL,
  user_id INT NOT NULL,
  rol ENUM('docente', 'preceptor') NOT NULL,
  dias_semana VARCHAR(20) DEFAULT NULL COMMENT 'Comma-separated day numbers (1=Mon..7=Sun); NULL=all days',
  FOREIGN KEY (curso_id) REFERENCES asis_cursos(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_curso (curso_id, user_id)
);

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

CREATE TABLE IF NOT EXISTS asis_faltas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  alumno_curso_id INT NOT NULL,
  fecha DATE NOT NULL,
  tipo_falta DECIMAL(3,2) NOT NULL,
  motivo VARCHAR(255) NULL,
  FOREIGN KEY (alumno_curso_id) REFERENCES asis_alumnos_curso(id) ON DELETE CASCADE,
  UNIQUE KEY unique_falta (alumno_curso_id, fecha)
);

CREATE TABLE IF NOT EXISTS asis_eventos_especiales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  curso_id INT NOT NULL,
  fecha DATE NOT NULL,
  descripcion VARCHAR(255) NOT NULL,
  horas_reloj DECIMAL(5,2) NOT NULL,
  horas_catedra DECIMAL(5,2) NOT NULL,
  FOREIGN KEY (curso_id) REFERENCES asis_cursos(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS asis_ausencias_docente (
  id INT AUTO_INCREMENT PRIMARY KEY,
  curso_id INT NOT NULL,
  user_id INT,
  fecha DATE NOT NULL,
  motivo VARCHAR(255) NULL,
  FOREIGN KEY (curso_id) REFERENCES asis_cursos(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE KEY unique_ausencia (curso_id, fecha, user_id)
);

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

CREATE TABLE IF NOT EXISTS asis_notificaciones_config (
  id INT AUTO_INCREMENT PRIMARY KEY,
  curso_id INT NOT NULL,
  email_destinatarios JSON NOT NULL,
  hora_envio TIME NULL,
  activo TINYINT(1) DEFAULT 0,
  FOREIGN KEY (curso_id) REFERENCES asis_cursos(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS asis_matriculacion_codigos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  curso_id INT NOT NULL,
  codigo VARCHAR(20) NOT NULL UNIQUE,
  activo TINYINT(1) DEFAULT 1,
  usos_maximos INT DEFAULT 0,
  usos_actuales INT DEFAULT 0,
  FOREIGN KEY (curso_id) REFERENCES asis_cursos(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS asis_import_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fecha_importacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  tabla_origen VARCHAR(50),
  registros_importados INT,
  registros_omitidos INT
);

