SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

CREATE DATABASE IF NOT EXISTS `scrum_eval` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci;
USE `scrum_eval`;

DROP TABLE IF EXISTS `academic_options`;
CREATE TABLE `academic_options` (
  `id` int(11) NOT NULL,
  `type` enum('school_year','year_div') NOT NULL,
  `value` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

DROP TABLE IF EXISTS `annual_closing_data`;
CREATE TABLE `annual_closing_data` (
  `id` int(11) NOT NULL,
  `cell_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `mvp_group_score` decimal(5,1) DEFAULT NULL,
  `individual_work_score` decimal(5,1) DEFAULT NULL,
  `group_work_score` decimal(5,1) DEFAULT NULL,
  `defense_score` decimal(5,1) DEFAULT NULL,
  `documentation_ok` tinyint(1) DEFAULT NULL,
  `certifications_ok` tinyint(1) DEFAULT NULL,
  `notebook_pages` int(11) DEFAULT NULL,
  `attendance_hours` decimal(5,1) DEFAULT NULL,
  `final_score` decimal(5,1) DEFAULT NULL,
  `approved` tinyint(1) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

DROP TABLE IF EXISTS `asis_alumnos_curso`;
CREATE TABLE `asis_alumnos_curso` (
  `id` int(11) NOT NULL,
  `curso_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `fecha_inscripcion` date NOT NULL DEFAULT curdate(),
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

DROP TABLE IF EXISTS `asis_ausencias_docente`;
CREATE TABLE `asis_ausencias_docente` (
  `id` int(11) NOT NULL,
  `curso_id` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `motivo` varchar(255) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

DROP TABLE IF EXISTS `asis_cursos`;
CREATE TABLE `asis_cursos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `anio` int(11) NOT NULL,
  `especialidad_id` int(11) NOT NULL,
  `division` varchar(10) NOT NULL,
  `turno` varchar(40) NOT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `legacy_id` int(11) DEFAULT NULL,
  `ciclo_lectivo` int(11) NOT NULL,
  `codigo_automatricula` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

DROP TABLE IF EXISTS `asis_dias_no_laborables`;
CREATE TABLE `asis_dias_no_laborables` (
  `id` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `motivo` varchar(255) NOT NULL,
  `tipo` varchar(50) DEFAULT 'feriado',
  `aplica_todos` tinyint(1) DEFAULT 1,
  `curso_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

DROP TABLE IF EXISTS `asis_docentes_curso`;
CREATE TABLE `asis_docentes_curso` (
  `id` int(11) NOT NULL,
  `curso_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `rol` enum('docente','preceptor') NOT NULL,
  `dias_semana` varchar(20) DEFAULT NULL COMMENT 'Comma-separated day numbers (1=Mon..7=Sun); NULL=all days'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

DROP TABLE IF EXISTS `asis_especialidades`;
CREATE TABLE `asis_especialidades` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

DROP TABLE IF EXISTS `asis_eventos_especiales`;
CREATE TABLE `asis_eventos_especiales` (
  `id` int(11) NOT NULL,
  `curso_id` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `descripcion` varchar(255) NOT NULL,
  `horas_reloj` decimal(5,2) NOT NULL,
  `horas_catedra` decimal(5,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

DROP TABLE IF EXISTS `asis_faltas`;
CREATE TABLE `asis_faltas` (
  `id` int(11) NOT NULL,
  `alumno_curso_id` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `tipo_falta` decimal(3,2) NOT NULL,
  `motivo` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

DROP TABLE IF EXISTS `asis_horarios`;
CREATE TABLE `asis_horarios` (
  `id` int(11) NOT NULL,
  `curso_id` int(11) NOT NULL,
  `dia_semana` tinyint(4) NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL,
  `hs_reloj` decimal(5,2) NOT NULL,
  `hs_catedra` decimal(5,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

DROP TABLE IF EXISTS `asis_import_log`;
CREATE TABLE `asis_import_log` (
  `id` int(11) NOT NULL,
  `fecha_importacion` datetime DEFAULT current_timestamp(),
  `tabla_origen` varchar(50) DEFAULT NULL,
  `registros_importados` int(11) DEFAULT NULL,
  `registros_omitidos` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

DROP TABLE IF EXISTS `asis_matriculacion_codigos`;
CREATE TABLE `asis_matriculacion_codigos` (
  `id` int(11) NOT NULL,
  `curso_id` int(11) NOT NULL,
  `codigo` varchar(20) NOT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `usos_maximos` int(11) DEFAULT 0,
  `usos_actuales` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

DROP TABLE IF EXISTS `asis_notificaciones`;
CREATE TABLE `asis_notificaciones` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `titulo` varchar(100) NOT NULL,
  `mensaje` text NOT NULL,
  `tipo` enum('alerta','info','advertencia') DEFAULT 'info',
  `leida` tinyint(1) DEFAULT 0,
  `fecha` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

DROP TABLE IF EXISTS `asis_notificaciones_config`;
CREATE TABLE `asis_notificaciones_config` (
  `id` int(11) NOT NULL,
  `curso_id` int(11) NOT NULL,
  `email_destinatarios` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`email_destinatarios`)),
  `hora_envio` time DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

DROP TABLE IF EXISTS `asis_parametros`;
CREATE TABLE `asis_parametros` (
  `clave` varchar(50) NOT NULL,
  `valor` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

DROP TABLE IF EXISTS `asis_registros`;
CREATE TABLE `asis_registros` (
  `id` int(11) NOT NULL,
  `alumno_curso_id` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `estado` enum('presente','ausente','tardia','retiro_anticipado') NOT NULL,
  `hora_ingreso` time DEFAULT NULL,
  `hora_egreso` time DEFAULT NULL,
  `correccion_manual` tinyint(1) DEFAULT 0,
  `created_by` int(11) NOT NULL,
  `justificacion` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

DROP TABLE IF EXISTS `bimestre_closures`;
CREATE TABLE `bimestre_closures` (
  `team_id` int(11) NOT NULL,
  `bimestre` int(11) NOT NULL,
  `closed_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `evaluations`;
CREATE TABLE `evaluations` (
  `id` int(11) NOT NULL,
  `period_id` int(11) NOT NULL,
  `evaluator_id` int(11) NOT NULL,
  `evaluatee_id` int(11) NOT NULL,
  `score_teamwork` decimal(3,2) NOT NULL,
  `score_development` decimal(3,2) NOT NULL,
  `score_class_work` decimal(3,2) NOT NULL,
  `is_sm_eval` tinyint(1) DEFAULT 0,
  `score_sm_leadership` decimal(3,2) DEFAULT NULL,
  `score_sm_facilitation` decimal(3,2) DEFAULT NULL,
  `score_sm_support` decimal(3,2) DEFAULT NULL,
  `comments` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `evaluation_periods`;
CREATE TABLE `evaluation_periods` (
  `id` int(11) NOT NULL,
  `label` varchar(100) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `bimestre` int(11) NOT NULL,
  `is_active` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

DROP TABLE IF EXISTS `final_grades`;
CREATE TABLE `final_grades` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `cell_id` int(11) DEFAULT NULL,
  `period_id` int(11) DEFAULT NULL,
  `individual_score` decimal(5,2) DEFAULT NULL,
  `group_score` decimal(5,2) DEFAULT NULL,
  `role_score` decimal(5,2) DEFAULT NULL,
  `final_score` decimal(5,2) DEFAULT NULL,
  `metrics_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metrics_json`)),
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

DROP TABLE IF EXISTS `grade_history`;
CREATE TABLE `grade_history` (
  `id` int(11) NOT NULL,
  `team_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `bimestre` int(11) NOT NULL,
  `calculated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `jira_score` decimal(5,2) DEFAULT 0.00,
  `group_score` decimal(5,2) DEFAULT 0.00,
  `attendance_score` decimal(5,2) DEFAULT 0.00,
  `teacher_score` decimal(5,2) DEFAULT 0.00,
  `notebook_score` decimal(5,2) DEFAULT 0.00,
  `coeval_score` decimal(5,2) DEFAULT 0.00,
  `final_score` decimal(5,2) DEFAULT 0.00,
  `backlog_total` int(11) DEFAULT 0,
  `backlog_finished` int(11) DEFAULT 0,
  `backlog_target` int(11) DEFAULT 0,
  `epic_total` int(11) DEFAULT 0,
  `epic_finished` int(11) DEFAULT 0,
  `balance_penalty` decimal(5,2) DEFAULT 0.00,
  `epic_penalty` decimal(5,2) DEFAULT 0.00,
  `raw_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`raw_data`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `jira_issues`;
CREATE TABLE `jira_issues` (
  `id` int(11) NOT NULL,
  `issue_key` varchar(20) DEFAULT NULL,
  `parent_key` varchar(20) DEFAULT NULL,
  `epic` varchar(255) DEFAULT NULL,
  `summary` text DEFAULT NULL,
  `issue_type` varchar(50) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `priority` varchar(50) DEFAULT NULL,
  `assignee_id` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `resolved_at` datetime DEFAULT NULL,
  `due_date` datetime DEFAULT NULL,
  `original_estimate` decimal(10,2) DEFAULT NULL,
  `time_spent` decimal(10,2) DEFAULT NULL,
  `vulnerability_count` int(11) DEFAULT 0,
  `cell_id` int(11) DEFAULT NULL,
  `story_points` decimal(5,2) DEFAULT 0.00,
  `sprint` varchar(255) DEFAULT NULL,
  `original_assignee_name` varchar(200) DEFAULT NULL,
  `carry_over` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

DROP TABLE IF EXISTS `scrum_attendance`;
CREATE TABLE `scrum_attendance` (
  `id` int(11) NOT NULL,
  `ceremony_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `attended` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

DROP TABLE IF EXISTS `scrum_bimestres_config`;
CREATE TABLE `scrum_bimestres_config` (
  `bimestre` int(11) NOT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

DROP TABLE IF EXISTS `scrum_ceremonies`;
CREATE TABLE `scrum_ceremonies` (
  `id` int(11) NOT NULL,
  `team_id` int(11) DEFAULT NULL,
  `period_id` int(11) DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

DROP TABLE IF EXISTS `scrum_masters`;
CREATE TABLE `scrum_masters` (
  `id` int(11) NOT NULL,
  `team_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `bimestre` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

DROP TABLE IF EXISTS `settings`;
CREATE TABLE `settings` (
  `id` int(11) NOT NULL,
  `key_name` varchar(50) DEFAULT NULL,
  `val` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

DROP TABLE IF EXISTS `task_reassignments`;
CREATE TABLE `task_reassignments` (
  `id` int(11) NOT NULL,
  `team_id` int(11) NOT NULL,
  `sprint_number` int(11) NOT NULL,
  `original_task_key` varchar(50) NOT NULL,
  `new_task_key` varchar(50) NOT NULL,
  `from_user_id` int(11) NOT NULL,
  `to_user_id` int(11) NOT NULL,
  `requested_by` int(11) NOT NULL,
  `reason` text NOT NULL,
  `assigned_at` date DEFAULT NULL,
  `reassigned_at` date DEFAULT NULL,
  `status` varchar(20) DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

DROP TABLE IF EXISTS `teacher_evaluations`;
CREATE TABLE `teacher_evaluations` (
  `id` int(11) NOT NULL,
  `period_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `score` decimal(3,1) NOT NULL,
  `comments` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `field_notebook_score` decimal(3,1) DEFAULT 0.0,
  `field_notebook_pages` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

DROP TABLE IF EXISTS `teams`;
CREATE TABLE `teams` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `external_id` varchar(100) DEFAULT NULL,
  `username` varchar(100) DEFAULT NULL,
  `email` varchar(150) NOT NULL,
  `password_md5` varchar(32) NOT NULL,
  `role_id` int(11) DEFAULT 2,
  `team_id` int(11) DEFAULT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `year_div` varchar(50) DEFAULT NULL,
  `school_year` varchar(50) DEFAULT NULL,
  `legacy_id` int(11) DEFAULT NULL,
  `dni` varchar(20) DEFAULT NULL,
  `telefono` varchar(60) DEFAULT NULL,
  `telefono_alternativo` varchar(60) DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `cuil` varchar(50) DEFAULT NULL,
  `nacionalidad` varchar(200) DEFAULT NULL,
  `genero` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;


ALTER TABLE `academic_options`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `annual_closing_data`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_cell_user` (`cell_id`,`user_id`);

ALTER TABLE `asis_alumnos_curso`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_alumno_curso` (`curso_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

ALTER TABLE `asis_ausencias_docente`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_ausencia` (`curso_id`,`fecha`,`user_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_ausencia_curso` (`curso_id`);

ALTER TABLE `asis_cursos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_codigo_automatricula` (`codigo_automatricula`),
  ADD KEY `especialidad_id` (`especialidad_id`);

ALTER TABLE `asis_dias_no_laborables`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_dia_no_laborable` (`fecha`,`curso_id`),
  ADD KEY `curso_id` (`curso_id`);

ALTER TABLE `asis_docentes_curso`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_curso` (`curso_id`,`user_id`),
  ADD KEY `asis_docentes_curso_ibfk_2` (`user_id`);

ALTER TABLE `asis_especialidades`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `asis_eventos_especiales`
  ADD PRIMARY KEY (`id`),
  ADD KEY `curso_id` (`curso_id`);

ALTER TABLE `asis_faltas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_falta` (`alumno_curso_id`,`fecha`);

ALTER TABLE `asis_horarios`
  ADD PRIMARY KEY (`id`),
  ADD KEY `curso_id` (`curso_id`);

ALTER TABLE `asis_import_log`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `asis_matriculacion_codigos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD KEY `curso_id` (`curso_id`);

ALTER TABLE `asis_notificaciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

ALTER TABLE `asis_notificaciones_config`
  ADD PRIMARY KEY (`id`),
  ADD KEY `curso_id` (`curso_id`);

ALTER TABLE `asis_parametros`
  ADD PRIMARY KEY (`clave`);

ALTER TABLE `asis_registros`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_asistencia_dia` (`alumno_curso_id`,`fecha`),
  ADD KEY `created_by` (`created_by`);

ALTER TABLE `bimestre_closures`
  ADD PRIMARY KEY (`team_id`,`bimestre`);

ALTER TABLE `evaluations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `period_id` (`period_id`),
  ADD KEY `evaluator_id` (`evaluator_id`),
  ADD KEY `evaluatee_id` (`evaluatee_id`);

ALTER TABLE `evaluation_periods`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `final_grades`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`,`cell_id`,`period_id`);

ALTER TABLE `grade_history`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_user_bimestre` (`user_id`,`bimestre`);

ALTER TABLE `jira_issues`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `issue_key` (`issue_key`),
  ADD KEY `assignee_id` (`assignee_id`);

ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `scrum_attendance`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `scrum_bimestres_config`
  ADD PRIMARY KEY (`bimestre`);

ALTER TABLE `scrum_ceremonies`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `scrum_masters`
  ADD PRIMARY KEY (`id`),
  ADD KEY `team_id` (`team_id`),
  ADD KEY `user_id` (`user_id`);

ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `key_name` (`key_name`);

ALTER TABLE `task_reassignments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `team_id` (`team_id`),
  ADD KEY `from_user_id` (`from_user_id`),
  ADD KEY `to_user_id` (`to_user_id`),
  ADD KEY `requested_by` (`requested_by`);

ALTER TABLE `teacher_evaluations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `period_id` (`period_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

ALTER TABLE `teams`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `role_id` (`role_id`),
  ADD KEY `team_id` (`team_id`);


ALTER TABLE `academic_options`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `annual_closing_data`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `asis_alumnos_curso`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `asis_ausencias_docente`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `asis_cursos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `asis_dias_no_laborables`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `asis_docentes_curso`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `asis_especialidades`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `asis_eventos_especiales`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `asis_faltas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `asis_horarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `asis_import_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `asis_matriculacion_codigos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `asis_notificaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `asis_notificaciones_config`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `asis_registros`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `evaluations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `evaluation_periods`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `final_grades`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `grade_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `jira_issues`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `scrum_attendance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `scrum_ceremonies`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `scrum_masters`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `task_reassignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `teacher_evaluations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `teams`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;


ALTER TABLE `asis_alumnos_curso`
  ADD CONSTRAINT `asis_alumnos_curso_ibfk_1` FOREIGN KEY (`curso_id`) REFERENCES `asis_cursos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `asis_alumnos_curso_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

ALTER TABLE `asis_ausencias_docente`
  ADD CONSTRAINT `asis_ausencias_docente_ibfk_1` FOREIGN KEY (`curso_id`) REFERENCES `asis_cursos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `asis_ausencias_docente_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

ALTER TABLE `asis_cursos`
  ADD CONSTRAINT `asis_cursos_ibfk_1` FOREIGN KEY (`especialidad_id`) REFERENCES `asis_especialidades` (`id`);

ALTER TABLE `asis_dias_no_laborables`
  ADD CONSTRAINT `asis_dias_no_laborables_ibfk_1` FOREIGN KEY (`curso_id`) REFERENCES `asis_cursos` (`id`) ON DELETE CASCADE;

ALTER TABLE `asis_docentes_curso`
  ADD CONSTRAINT `asis_docentes_curso_ibfk_1` FOREIGN KEY (`curso_id`) REFERENCES `asis_cursos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `asis_docentes_curso_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

ALTER TABLE `asis_eventos_especiales`
  ADD CONSTRAINT `asis_eventos_especiales_ibfk_1` FOREIGN KEY (`curso_id`) REFERENCES `asis_cursos` (`id`) ON DELETE CASCADE;

ALTER TABLE `asis_faltas`
  ADD CONSTRAINT `asis_faltas_ibfk_1` FOREIGN KEY (`alumno_curso_id`) REFERENCES `asis_alumnos_curso` (`id`) ON DELETE CASCADE;

ALTER TABLE `asis_horarios`
  ADD CONSTRAINT `asis_horarios_ibfk_1` FOREIGN KEY (`curso_id`) REFERENCES `asis_cursos` (`id`) ON DELETE CASCADE;

ALTER TABLE `asis_matriculacion_codigos`
  ADD CONSTRAINT `asis_matriculacion_codigos_ibfk_1` FOREIGN KEY (`curso_id`) REFERENCES `asis_cursos` (`id`) ON DELETE CASCADE;

ALTER TABLE `asis_notificaciones`
  ADD CONSTRAINT `asis_notificaciones_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

ALTER TABLE `asis_notificaciones_config`
  ADD CONSTRAINT `asis_notificaciones_config_ibfk_1` FOREIGN KEY (`curso_id`) REFERENCES `asis_cursos` (`id`) ON DELETE CASCADE;

ALTER TABLE `asis_registros`
  ADD CONSTRAINT `asis_registros_ibfk_1` FOREIGN KEY (`alumno_curso_id`) REFERENCES `asis_alumnos_curso` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `asis_registros_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

ALTER TABLE `task_reassignments`
  ADD CONSTRAINT `task_reassignments_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`),
  ADD CONSTRAINT `task_reassignments_ibfk_2` FOREIGN KEY (`from_user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `task_reassignments_ibfk_3` FOREIGN KEY (`to_user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `task_reassignments_ibfk_4` FOREIGN KEY (`requested_by`) REFERENCES `users` (`id`);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
