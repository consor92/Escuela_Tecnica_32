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

INSERT IGNORE INTO roles (id, name) VALUES (1, 'Docente'), (2, 'Alumno');

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
