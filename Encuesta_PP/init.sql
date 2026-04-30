CREATE DATABASE IF NOT EXISTS scrum_eval;
USE scrum_eval;

-- Tabla de Roles
CREATE TABLE roles (
    id INT PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

INSERT INTO roles (id, name) VALUES (1, 'Docente'), (2, 'Alumno');

-- Tabla de Equipos
CREATE TABLE teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- Tabla de Usuarios
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    external_id INT, -- ID del CSV
    username VARCHAR(100),
    email VARCHAR(150) UNIQUE NOT NULL,
    password_md5 VARCHAR(32) NOT NULL,
    role_id INT DEFAULT 2,
    team_id INT,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (team_id) REFERENCES teams(id)
);

-- Tabla de Periodos de Evaluación (Bisemanales)
CREATE TABLE evaluation_periods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    label VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    bimestre INT NOT NULL, -- 1: Mar-Abr, 2: May-Jun, 3: Jul-Sep, 4: Oct-Nov
    is_active TINYINT(1) DEFAULT 0
);

-- Pre-cargar periodos bisemanales aproximados para 2026
INSERT INTO evaluation_periods (label, start_date, end_date, bimestre) VALUES
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

-- Tabla de Evaluaciones (Actualizada para múltiples criterios 1-4)
CREATE TABLE evaluations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    period_id INT NOT NULL,
    evaluator_id INT NOT NULL,
    evaluatee_id INT NOT NULL,
    score_teamwork DECIMAL(3,2) NOT NULL, -- 1-4
    score_development DECIMAL(3,2) NOT NULL, -- 1-4
    score_class_work DECIMAL(3,2) NOT NULL, -- 1-4
    is_sm_eval TINYINT(1) DEFAULT 0,
    score_sm_leadership DECIMAL(3,2) DEFAULT NULL, -- 1-4
    score_sm_facilitation DECIMAL(3,2) DEFAULT NULL, -- 1-4
    score_sm_support DECIMAL(3,2) DEFAULT NULL, -- 1-4
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (period_id) REFERENCES evaluation_periods(id),
    FOREIGN KEY (evaluator_id) REFERENCES users(id),
    FOREIGN KEY (evaluatee_id) REFERENCES users(id)
);

-- Nueva tabla para asignación formal de SM por docente
CREATE TABLE scrum_masters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_id INT NOT NULL,
    user_id INT NOT NULL,
    bimestre INT NOT NULL, -- 1, 2, 3, 4
    FOREIGN KEY (team_id) REFERENCES teams(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
