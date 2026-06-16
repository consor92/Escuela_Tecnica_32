-- =============================================
-- SCRIPT DE INICIALIZACIÓN DEFINITIVO: ÁLBUM 32
-- Versión: 6.1 (SIN COLUMNA DNI, ENUM ACTUALIZADO)
-- =============================================

CREATE DATABASE IF NOT EXISTS album_32 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE album_32;

-- 1. Tabla de Configuraciones Globales
CREATE TABLE IF NOT EXISTS settings (
    `key` VARCHAR(50) PRIMARY KEY,
    `value` TEXT NOT NULL
) ENGINE=InnoDB;

INSERT IGNORE INTO settings (`key`, `value`) VALUES ('qr_base_url', 'http://localhost/figus/');
INSERT IGNORE INTO settings (`key`, `value`) VALUES ('drive_base_url', 'https://lh3.googleusercontent.com/u/0/d/');
INSERT IGNORE INTO settings (`key`, `value`) VALUES ('promo_reward_rates', '{"1":10,"2":25,"3":30,"4":25,"5":10}');
INSERT IGNORE INTO settings (`key`, `value`) VALUES ('rarity_rates', '{"common":50,"uncommon":30,"rare":20,"holo":7,"gold":3}');
INSERT IGNORE INTO settings (`key`, `value`) VALUES ('happy_hour', '0');
INSERT IGNORE INTO settings (`key`, `value`) VALUES ('maintenance_mode', '0');
INSERT IGNORE INTO settings (`key`, `value`) VALUES ('podium_turn_restriction', '0');
INSERT IGNORE INTO settings (`key`, `value`) VALUES ('qr_cooldown', '2');
INSERT IGNORE INTO settings (`key`, `value`) VALUES ('trivia_cooldown', '2');
INSERT IGNORE INTO settings (`key`, `value`) VALUES ('trade_bonus_rate', '5');

-- 2. Tabla de Usuarios
CREATE TABLE IF NOT EXISTS users (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `username` varchar(50) NOT NULL,
    `password` varchar(255) NOT NULL,
    `full_name` varchar(100) NOT NULL,
    `course` enum('4°3','5°2','6°2','Sistemas','Profesor') NOT NULL,
    `shift` enum('mañana','tarde','vespertino') DEFAULT 'vespertino',
    `role` enum('alumno','docente','admin') DEFAULT 'alumno',
    `packs_available` int(11) DEFAULT 0,
    `album_completed` tinyint(1) DEFAULT 0,
    `completed_at` datetime DEFAULT NULL,
    `last_trivia_at` datetime DEFAULT NULL,
    `is_admin` tinyint(1) DEFAULT 0,
    `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
    PRIMARY KEY (`id`),
    UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2.1 Tabla de Asociación Curso-Turno
CREATE TABLE IF NOT EXISTS course_shifts (
    course VARCHAR(50) PRIMARY KEY,
    shift ENUM('mañana', 'tarde', 'vespertino') DEFAULT 'vespertino'
) ENGINE=InnoDB;

-- 3. Tabla de Lista Blanca
CREATE TABLE IF NOT EXISTS whitelist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dni VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    is_used TINYINT NOT NULL, 
    course ENUM('4°3', '5°2', '6°2') NOT NULL
) ENGINE=InnoDB;

-- 4. Tabla de Álbumes
CREATE TABLE IF NOT EXISTS albums (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    total_stickers INT NOT NULL DEFAULT 50,
    cover_img VARCHAR(255) ,
    back_cover_img VARCHAR(255) ,
    page_bg_p1 VARCHAR(255) ,
    page_bg_p2 VARCHAR(255) ,
    page_bg_p3 VARCHAR(255) ,
    page_bg_p4 VARCHAR(255) DEFAULT NULL,
    page_bg_p5 VARCHAR(255) DEFAULT NULL,
    honor_page_1_bg VARCHAR(255) ,
    honor_page_2_bg VARCHAR(255) ,
    pack_img VARCHAR(255) ,
    sticker_back_img VARCHAR(255),
    sticker_frame_border_img VARCHAR(255) ,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT IGNORE INTO albums (id, name, total_stickers) VALUES (1, 'Camino al 20 de Junio', 50);
INSERT IGNORE INTO albums (id, name, total_stickers) VALUES (2, 'Dia del Maestro', 50);

-- 5. Lotes de Promoción (Asignados a Profesores/Admin)
CREATE TABLE IF NOT EXISTS promo_batches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id INT NOT NULL,
    admin_id INT NOT NULL,
    reference VARCHAR(100) NOT NULL,
    quantity INT NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES users(id),
    FOREIGN KEY (admin_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- 6. Tabla de Figuritas
CREATE TABLE IF NOT EXISTS stickers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    album_id INT NOT NULL DEFAULT 1,
    number INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    rarity ENUM('common', 'uncommon', 'rare', 'holo', 'gold') NOT NULL,
    external_url VARCHAR(255) NOT NULL,
    UNIQUE KEY (album_id, number),
    FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. Códigos Promocionales
CREATE TABLE IF NOT EXISTS promo_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    batch_id INT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    packs_reward INT DEFAULT 1,
    max_uses INT DEFAULT 50,
    used_by_count INT DEFAULT 0,
    is_used TINYINT(1) DEFAULT 0,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (batch_id) REFERENCES promo_batches(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8. Inventario de Usuarios
CREATE TABLE IF NOT EXISTS user_inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    sticker_id INT NOT NULL,
    quantity INT DEFAULT 1,
    is_stuck TINYINT(1) DEFAULT 0,
    UNIQUE KEY (user_id, sticker_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (sticker_id) REFERENCES stickers(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 9. Uso de Códigos por Usuario
CREATE TABLE IF NOT EXISTS user_promo_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    code_id INT NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (code_id) REFERENCES promo_codes(id) ON DELETE CASCADE,
    UNIQUE KEY (user_id, code_id)
) ENGINE=InnoDB;

-- 10. Estaciones QR y Auditoría
CREATE TABLE IF NOT EXISTS qr_stations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    display_name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) NOT NULL UNIQUE,
    type ENUM('pack', 'trivia') DEFAULT 'pack',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS qr_scans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    qr_station_id INT NOT NULL,
    scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (qr_station_id) REFERENCES qr_stations(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS audit_packs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    source_type ENUM('qr', 'trivia', 'promo', 'trade', 'admin') NOT NULL,
    source_id VARCHAR(100) NULL,
    amount INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 11. Catálogo de Trivias
CREATE TABLE IF NOT EXISTS trivias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    question TEXT NOT NULL,
    option_a VARCHAR(255) NOT NULL,
    option_b VARCHAR(255) NOT NULL,
    option_c VARCHAR(255) NOT NULL,
    correct_option CHAR(1) NOT NULL,
    is_active TINYINT(1) DEFAULT 1
) ENGINE=InnoDB;



--
-- Estructura de tabla para la tabla `user_albums`
--

CREATE TABLE `user_albums` (
  `user_id` int(11) NOT NULL,
  `album_id` int(11) NOT NULL,
  `is_completed` tinyint(1) DEFAULT 0,
  `completed_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Estructura de tabla para la tabla `user_trivias`
--

CREATE TABLE `user_trivias` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `trivia_id` int(11) NOT NULL,
  `answered_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Indices de la tabla `user_albums`
--
ALTER TABLE `user_albums`
  ADD PRIMARY KEY (`user_id`,`album_id`),
  ADD KEY `album_id` (`album_id`);

--
-- Indices de la tabla `user_trivias`
--
ALTER TABLE `user_trivias`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`,`trivia_id`),
  ADD KEY `trivia_id` (`trivia_id`);

--
-- AUTO_INCREMENT de la tabla `user_trivias`
--
ALTER TABLE `user_trivias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Filtros para la tabla `user_albums`
--
ALTER TABLE `user_albums`
  ADD CONSTRAINT `user_albums_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_albums_ibfk_2` FOREIGN KEY (`album_id`) REFERENCES `albums` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `user_trivias`
--
ALTER TABLE `user_trivias`
  ADD CONSTRAINT `user_trivias_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_trivias_ibfk_2` FOREIGN KEY (`trivia_id`) REFERENCES `trivias` (`id`) ON DELETE CASCADE;
COMMIT;




INSERT IGNORE INTO users (username, password, full_name, course, packs_available, is_admin, role) VALUES 
('admin', '$2y$10$9.rNKnwWLK3XNiJc.4QDTuw4RBYgiv66zzM42CPCqylYa7byY.3Bi', 'Administrador General', 'Sistemas', 999, 1, 'admin');

INSERT IGNORE INTO users (username, password, full_name, course, packs_available, is_admin, role) VALUES 
('consorti', '$2y$10$9.rNKnwWLK3XNiJc.4QDTuw4RBYgiv66zzM42CPCqylYa7byY.3Bi', 'Docente', 'Profesor', 5, 0, 'docente');

INSERT IGNORE INTO users (username, password, full_name, course, packs_available, is_admin, role) VALUES 
('olaso', '$2y$10$9.rNKnwWLK3XNiJc.4QDTuw4RBYgiv66zzM42CPCqylYa7byY.3Bi', 'Docente', 'Profesor', 5, 0, 'docente');


INSERT INTO `stickers` (`id`, `album_id`, `number`, `name`, `description`, `rarity`, `external_url`) VALUES
(1, 1, 1, 'Manuel Belgrano (Retrato)', 'Abogado, economista y gran estratega militar argentino. Creador de nuestra bandera nacional.', 'gold', '1n-UtmuD8js5GN5SiSnXXhqjzP39oyrQg'),
(2, 1, 2, 'Bandera de Macha', 'Una de las banderas más antiguas que se conservan de la época de la independencia.', 'common', '1n-UtmuD8js5GN5SiSnXXhqjzP39oyrQg'),
(3, 1, 3, 'Cabildo de 1810', 'Lugar histórico donde se gestó el primer gobierno patrio en la Semana de Mayo.', 'uncommon', '1n-UtmuD8js5GN5SiSnXXhqjzP39oyrQg'),
(4, 1, 4, 'Éxodo Jujeño', 'Belgrano lideró el retiro del pueblo jujeño para no dejar recursos al avance realista.', 'rare', '1n-UtmuD8js5GN5SiSnXXhqjzP39oyrQg'),
(5, 1, 5, 'Batalla de Tucumán', 'Triunfo clave de Belgrano que frenó el avance realista en el norte argentino.', 'common', '1n-UtmuD8js5GN5SiSnXXhqjzP39oyrQg'),
(6, 1, 6, 'Batalla de Salta', 'Victoria donde se utilizó por primera vez la bandera celeste y blanca en combate.', 'uncommon', '1n-UtmuD8js5GN5SiSnXXhqjzP39oyrQg'),
(7, 1, 7, 'Rosario: Creación de la Bandera', 'En las orillas del Paraná, Belgrano enarboló por primera vez nuestro símbolo patrio.', 'rare', '1n-UtmuD8js5GN5SiSnXXhqjzP39oyrQg'),
(8, 1, 8, 'Retrato Juvenil Belgrano', 'Imagen que muestra a Belgrano durante sus estudios en España y su formación humanista.', 'common', '1n-UtmuD8js5GN5SiSnXXhqjzP39oyrQg'),
(9, 1, 9, 'La Escarapela', 'Símbolo distintivo creado por Belgrano para identificar a sus tropas en la lucha.', 'uncommon', '1n-UtmuD8js5GN5SiSnXXhqjzP39oyrQg'),
(10, 1, 10, 'Belgrano en España', 'Años de formación intelectual donde Belgrano absorbió las ideas de la Ilustración.', 'rare', '1n-UtmuD8js5GN5SiSnXXhqjzP39oyrQg'),
(11, 1, 11, 'Consulado de Comercio', 'Institución donde Belgrano impulsó la industria, el agro y la educación pública.', 'uncommon', '1n-UtmuD8js5GN5SiSnXXhqjzP39oyrQg'),
(12, 1, 12, 'Invasiones Inglesas', 'Belgrano participó activamente en la defensa de Buenos Aires frente al invasor británico.', 'common', '1n-UtmuD8js5GN5SiSnXXhqjzP39oyrQg'),
(13, 1, 13, 'Expedición al Paraguay', 'Difícil misión militar y política encargada por la Junta tras la revolución de mayo.', 'rare', '1n-UtmuD8js5GN5SiSnXXhqjzP39oyrQg'),
(14, 1, 14, 'Tambor de Tacuarí', 'Niño soldado que alentó a las tropas de Belgrano con su tambor durante el combate.', 'common', '1n-UtmuD8js5GN5SiSnXXhqjzP39oyrQg'),
(15, 1, 15, 'Encuentro con San Martín', 'Momento histórico donde los dos grandes próceres coordinaron la defensa del norte.', 'uncommon', '1n-UtmuD8js5GN5SiSnXXhqjzP39oyrQg'),
(16, 1, 16, 'Posta de Yatasto', 'Lugar legendario del abrazo fraternal entre Belgrano y el general José de San Martín.', 'rare', '1n-UtmuD8js5GN5SiSnXXhqjzP39oyrQg'),
(17, 1, 17, 'Ejército del Norte', 'Fuerza militar comandada por Belgrano en las campañas libertadoras del Alto Perú.', 'uncommon', '1n-UtmuD8js5GN5SiSnXXhqjzP39oyrQg'),
(18, 1, 18, 'Belgrano Periodista', 'Fundador del Telégrafo Mercantil, Belgrano usó la pluma para difundir ideas de progreso.', 'common', '1n-UtmuD8js5GN5SiSnXXhqjzP39oyrQg'),
(19, 1, 19, 'Correo de Comercio', 'Semanario fundado por Belgrano para debatir sobre economía, agricultura y educación.', 'holo', '1n-UtmuD8js5GN5SiSnXXhqjzP39oyrQg'),
(20, 1, 20, 'Donación de Premios', 'Belgrano donó sus 40.000 pesos de premios para la creación de cuatro escuelas públicas.', 'uncommon', '1n-UtmuD8js5GN5SiSnXXhqjzP39oyrQg'),
(21, 1, 21, '4 Escuelas Públicas', 'El legado educativo de Belgrano: escuelas en Tarija, Jujuy, Tucumán y Santiago del Estero.', 'rare', '1n-UtmuD8js5GN5SiSnXXhqjzP39oyrQg'),
(22, 1, 22, 'Constitución de 1819', 'Participación de Belgrano en los debates institucionales sobre la organización del país.', 'common', '1n-UtmuD8js5GN5SiSnXXhqjzP39oyrQg'),
(23, 1, 23, 'Fallecimiento de Belgrano', 'El 20 de junio de 1820 murió en la pobreza absoluta, fiel a sus ideales de servicio.', 'holo', '1n-UtmuD8js5GN5SiSnXXhqjzP39oyrQg'),
(24, 1, 24, 'Últimas Palabras', '\"Ay, Patria mía\", suspiros finales de un hombre que entregó su vida por la nación.', 'uncommon', '1n-UtmuD8js5GN5SiSnXXhqjzP39oyrQg'),
(25, 1, 25, 'Monumento a la Bandera', 'Emblemático sitio en Rosario que homenajea la creación de nuestro primer pabellón.', 'common', '1n-UtmuD8js5GN5SiSnXXhqjzP39oyrQg'),
(26, 1, 26, 'E.T. Nº 32 Logo', 'Identidad de nuestra querida escuela técnica unida al sentimiento patriótico.', 'rare', '1n-UtmuD8js5GN5SiSnXXhqjzP39oyrQg'),
(27, 1, 27, 'Taller de Carpintería', 'Donde se forja la técnica y el oficio con la nobleza de la madera. Orgullo de la 32.', 'uncommon', '1n-UtmuD8js5GN5SiSnXXhqjzP39oyrQg'),
(28, 1, 28, 'Taller de Mecánica', 'Precisión y fierros: los alumnos de la 32 aprendiendo el motor del desarrollo.', 'rare', '1n-UtmuD8js5GN5SiSnXXhqjzP39oyrQg'),
(29, 1, 29, 'Taller de Electricidad', 'Circuitos y energía: la potencia técnica de nuestros estudiantes en acción.', 'uncommon', '1n-UtmuD8js5GN5SiSnXXhqjzP39oyrQg'),
(30, 1, 30, 'Taller de Electrónica', 'Innovación y microcontroladores: el futuro tecnológico de la E.T. 32.', 'holo', '1n-UtmuD8js5GN5SiSnXXhqjzP39oyrQg'),
(31, 1, 31, 'Dibujo Técnico', 'La base de todo proyecto: planos y precisión trazados por manos expertas.', 'common', '1n-UtmuD8js5GN5SiSnXXhqjzP39oyrQg'),
(32, 1, 32, 'Día de la Técnica', 'Celebración de la educación técnica, motor fundamental de nuestra Argentina.', 'uncommon', '1n-UtmuD8js5GN5SiSnXXhqjzP39oyrQg'),
(33, 1, 33, 'Formación Ética', 'Educando ciudadanos comprometidos con el respeto y los valores belgranianos.', 'rare', '1n-UtmuD8js5GN5SiSnXXhqjzP39oyrQg'),
(34, 1, 34, 'Educación Física', 'Mente sana en cuerpo sano: el deporte y la salud en nuestra comunidad escolar.', 'uncommon', '1n-UtmuD8js5GN5SiSnXXhqjzP39oyrQg'),
(35, 1, 35, 'Laboratorio de Informática', 'Sistemas e informática: la especialidad de vanguardia de la técnica 32.', 'common', '1n-UtmuD8js5GN5SiSnXXhqjzP39oyrQg'),
(36, 1, 36, 'Belgrano y la Educación', 'Para Belgrano, la educación era el fundamento de la libertad de los pueblos.', 'rare', '1n-UtmuD8js5GN5SiSnXXhqjzP39oyrQg'),
(37, 1, 37, 'Reglamento de 1813', 'Instrucciones pioneras para el fomento de la agricultura y la industria nacional.', 'holo', '1n-UtmuD8js5GN5SiSnXXhqjzP39oyrQg'),
(38, 1, 38, 'Misión Diplomática Londres', 'Belgrano buscó el reconocimiento de nuestra independencia ante las potencias europeas.', 'common', '1n-UtmuD8js5GN5SiSnXXhqjzP39oyrQg'),
(39, 1, 39, 'Escudo de Armas Belgrano', 'Blasón de la familia Belgrano, símbolo de su linaje y servicio a la corona y la patria.', 'uncommon', '1n-UtmuD8js5GN5SiSnXXhqjzP39oyrQg'),
(40, 1, 40, 'Día del Graduado Cs Ec', 'En honor al primer economista patrio: Manuel Belgrano, pionero del pensamiento económico.', 'rare', '1n-UtmuD8js5GN5SiSnXXhqjzP39oyrQg'),
(41, 1, 41, 'Proyecto Monarquía Inca', 'Propuesta de Belgrano para unificar el continente bajo un descendiente de los Incas.', 'common', '1n-UtmuD8js5GN5SiSnXXhqjzP39oyrQg'),
(42, 1, 42, 'Congreso de Tucumán', 'Belgrano fue una voz influyente que instó a los congresales a declarar la independencia.', 'uncommon', '1n-UtmuD8js5GN5SiSnXXhqjzP39oyrQg'),
(43, 1, 43, 'Fachada E.T. 32', 'Nuestra casa de estudios, donde formamos a los técnicos del futuro.', 'rare', '1n-UtmuD8js5GN5SiSnXXhqjzP39oyrQg'),
(44, 1, 44, 'Patio de Formación', 'Espacio de encuentro de toda la comunidad educativa de la técnica 32.', 'common', '1n-UtmuD8js5GN5SiSnXXhqjzP39oyrQg'),
(45, 1, 45, 'Himno Nacional', 'Símbolo que junto a la bandera nos une en el sentimiento de libertad.', 'uncommon', '1n-UtmuD8js5GN5SiSnXXhqjzP39oyrQg'),
(46, 1, 46, '⭐ BELGRANO GOLD ⭐', 'Edición legendaria en honor al sacrificio y honestidad de nuestro máximo prócer.', 'holo', '1n-UtmuD8js5GN5SiSnXXhqjzP39oyrQg'),
(47, 1, 47, '⭐ BANDERA ARGENTINA ⭐', 'El símbolo máximo de unión y soberanía nacional, creada por Manuel Belgrano.', 'common', '1n-UtmuD8js5GN5SiSnXXhqjzP39oyrQg'),
(48, 1, 48, '⭐ LIBERTAD ⭐', 'El ideal por el cual Belgrano entregó su vida, su fortuna y su salud.', 'holo', '1n-UtmuD8js5GN5SiSnXXhqjzP39oyrQg'),
(49, 1, 49, '⭐ INDEPENDENCIA ⭐', 'Grito sagrado que resuena desde 1816 en todo el suelo argentino.', 'holo', '1n-UtmuD8js5GN5SiSnXXhqjzP39oyrQg'),
(50, 1, 50, '⭐ GRAN PREMIO 3D ⭐', '¡Felicidades! Has completado el álbum. Canjea esta figu por tu impresión 3D.', 'gold', '1n-UtmuD8js5GN5SiSnXXhqjzP39oyrQg');




INSERT INTO whitelist (dni, email, full_name, course)
VALUES 
    ('758003533', 'vitalii.andriashet32@gmail.com', 'Vitalii Andriiash', '4°3'),
    ('50158631', 'francocaffarello.et32@gmail.com', 'Franco Caffarello', '4°3'),
    ('48501812', 'braiancomini14et32@gmail.com', 'Braian Elias Comini', '4°3'),
    ('48592638', 'manuelgabarrus420@gmail.com', 'Manuel Federico Gabarrus Barlocco', '4°3'),
    ('50031480', 'thiagoleschinskiet32@gmail.com', 'Thiago Esteban Leschinski', '4°3'),
    ('96322302', 'tim11mik@gmail.com', 'Timur Mikriukov', '4°3'),
    ('49758065', 'lucianopallero113@gmail.com', 'Luciano Joaquin Pallero', '4°3'),
    ('49926038', 'lazaro.pintos.et32@gmail.com', 'Rodrigo Pintos Rojas', '4°3'),
    ('96115326', 'diego.rodriguezet32@gmail.com', 'Diego Rodriguez Espinoza', '4°3'),
    ('49939176', 'maximo.rafa.saavedra@gmail.com', 'MAXIMO RAFAEL SAAVEDRA MAMANI', '4°3'),
    ('49625919', 'emiliano.slaboviket32@gmail.com', 'Emiliano Slabovik', '4°3'),
    ('95360100', 'jhosuetr40@gmail.com', 'Ahraghon Jhosue Teran Rodriguez', '4°3'),
    ('50305244', 'ianfranco.vallejoet32@gmail.com', 'Ian Vallejo', '4°3');


INSERT INTO whitelist (dni, email, full_name, course)
VALUES 
    ('48312045', 'leonardo.arenas5to@gmail.com', 'Leonardo Joel Arenas', '5°2'),
    ('49191584', 'mauro.armendiaet32@gmail.com', 'Mauro Armendia Tornay', '5°2'),
    ('47570681', 'matias.aspi.et32@gmail.com', 'Franco Matías Aspi Cosme', '5°2'),
    ('49067102', 'lianavalos.et32@gmail.com', 'Lian Román Avalos', '5°2'),
    ('48111851', 'valentin3.bruzzaet32@gmail.com', 'Valentin Bruzza', '5°2'),
    ('49434332', 'demiannataniel.correa32@gmail.com', 'Demian Nataniel Correa', '5°2'),
    ('48716008', 'lautaro.desantiset32@gmail.com', 'Lautaro Nicolás De Santis Salvia', '5°2'),
    ('48802452', 'mateonahuel480@gmail.com', 'Mateo Nahuel Diaz', '5°2'),
    ('49319569', 'manuelremofernandezmassaet32@gmail.com', 'Manuel Remo Fernandez Massa', '5°2'),
    ('96058894', 'aquiles.guzmanet32@gmail.com', 'Aquiles David Guzman Figuera', '5°2'),
    ('49094005', 'thiago.lopezet32@gmail.com', 'Thiago Luis Lopez', '5°2'),
    ('764706393', 'maximov.r.a@gmail.com', 'Ruslan Maksimov', '5°2'),
    ('49163663', 'ivan.naydenkoet32@gmail.com', 'Ivan Naydenko', '5°2'),
    ('47344041', 'maximo.rodriguezet32@gmail.com', 'Maximo Tomás Rodriguez', '5°2'),
    ('49553609', 'lucas.santi.et32@gmail.com', 'Lucas Santi Rodriguez', '5°2'),
    ('49319517', 'agusti.sapir.et32@gmail.com', 'Agustin Matias Sapir', '5°2'),
    ('49175682', 'matiassolis0104@gmail.com', 'Matias Stanley Solis Vasquez', '5°2'),
    ('49089840', 'alba.spitalniket32@gmail.com', 'Alba Paula Spitalnik', '5°2'),
    ('95575414', 'willian.vargas.et32@gmail.com', 'Willian Jesús Vargas Martinez', '5°2'),
    ('48795776', 'thiago.viana.et32@gmail.com', 'Thiago Viana Leiba', '5°2');

INSERT INTO whitelist (dni, email, full_name, course)
VALUES 
    ('47717177', 'rodriacevedoet32@gmail.com', 'Nahuel Rodrigo Acevedo Toloza', '6°2'),
    ('48044991', 'ignacio.alvarezet32@gmail.com', 'Ignacio Ezequiel Alvarez', '6°2'),
    ('48246399', 'gaston.amayaet32@gmail.com', 'Gaston Leandro Amaya', '6°2'),
    ('48242520', 'ramiro.averbujet32@gmail.com', 'Ramiro Averbuj Capelli', '6°2'),
    ('48384377', 'thiago.casianoet32@gmail.com', 'Thiago Valentin Casiano', '6°2'),
    ('48464784', 'gustavo.creczukaragonet32@gmail.com', 'Gustavo Ariel Czreczuk Aragon', '6°2'),
    ('48309797', 'brunella.figalloet32@gmail.com', 'Brunella Mia Figallo Stroscio', '6°2'),
    ('48591418', 'tomas.fleitaset32@gmail.com', 'Tomas Fleita', '6°2'),
    ('48591700', 'lukas.alexis.gonzalez32@gmail.com', 'Lukas Gonzalez', '6°2'),
    ('48296372', 'morena.ferreyraet32@gmail.com', 'Morena Aylen Gonzalez Ferreyra', '6°2'),
    ('48244142', 'ixmatt2@gmail.com', 'Ismael Gonzalez Merayo', '6°2'),
    ('47172330', 'sgonzalezvigoet32@gmail.com', 'Santiago David Gonzalez Vigo', '6°2'),
    ('47679949', 'los.nigrelitos@gmail.com', 'Alma Veronica Gutierrez', '6°2'),
    ('94441521', 'hidalgonicolasadrian@gmail.com', 'Adrian Nicolas Hidalgo Alvarez', '6°2'),
    ('47860388', 'benjamin.ibanezet32@gmail.com', 'Benjamin Mateo Ibañez Luna', '6°2'),
    ('48315571', 'benjamin.korstanjeet32@gmail.com', 'Benjamin Korstanje', '6°2'),
    ('48461070', 'felipekuolee.et32@gmail.com', 'Felipe Kuo Lee', '6°2'),
    ('48116398', 'juanpablollanoset32@gmail.com', 'Juan Pablo Llanos', '6°2'),
    ('48241492', 'martin.lopezschillaciet32@gmail.com', 'Martin Lopez Schilliaci', '6°2'),
    ('95123384', 'santiago.mamaniet32@gmail.com', 'Adrian Santiago Mamani Laguna', '6°2'),
    ('48357320', 'lucca.martinez0@gmail.com', 'Lucca Leonel Martinez Carbuto', '6°2'),
    ('47679948', 'raulmartinezpersonal0@gmail.com', 'Raúl Luis Martinez Cretu', '6°2'),
    ('48311614', 'rosendo.osoreset32@gmail.com', 'Rosendo Gabriel Osores Borda', '6°2'),
    ('48041245', 'valentinapalacioset32@gmail.com', 'Valentina Abigail Palacios Barrionuevo', '6°2'),
    ('48588109', 'ianpaladea120@gmail.com', 'Ian Gabriel Paladea Ruiz Cabezas', '6°2'),
    ('48183787', 'leonel.pedraza.et32@gmail.com', 'Leonel Emiliano Pedraza', '6°2'),
    ('48675712', 'santiago.pont.indu6@gmail.com', 'Santiago Martin Pont', '6°2'),
    ('48311216', 'franco.quarembaet32@gmail.com', 'Franco Quaremba', '6°2'),
    ('48803068', 'martin.romeroket32@gmail.com', 'Martin Romero Krawczyk', '6°2'),
    ('47653211', 'marcos.torreset32@gmail.com', 'Marcos Daniel Torres', '6°2'),
    ('95230125', 'cristofer.velaet32@gmail.com', 'Cristofer Andre Vela Moran', '6°2'),
    ('48503796', 'cabraltoledomaximomartinet.32@gmail.com', 'Maximo Martin Cabral Toledo', '6°2');


INSERT INTO trivias (category, question, option_a, option_b, option_c, correct_option) VALUES

-- Especial Manuel Belgrano y Día de la Bandera (7 preguntas)
('Belgrano y La Bandera', '¿En qué fecha conmemoramos el Día de la Bandera?', '25 de mayo', '20 de junio', '9 de julio', 'B'),
('Belgrano y La Bandera', '¿A orillas de qué río Belgrano izó la bandera por primera vez?', 'Río de la Plata', 'Río Paraná', 'Río Uruguay', 'B'),
('Belgrano y La Bandera', '¿Cuál era la verdadera profesión de Belgrano antes de ser militar?', 'Médico', 'Abogado', 'Arquitecto', 'B'),
('Belgrano y La Bandera', 'Además de crear la bandera, ¿qué donó Belgrano para construir escuelas?', 'Sus campos', 'Sus premios militares', 'Sus libros', 'B'),
('Belgrano y La Bandera', 'En su reglamento escolar de 1813, ¿qué prohibió Belgrano terminantemente?', 'Estudiar de memoria', 'Los castigos físicos', 'Los recreos largos', 'B'),
('Belgrano y La Bandera', '¿Qué heroica retirada civil y militar lideró Belgrano en el norte argentino?', 'El Éxodo Jujeño', 'El Cruce de los Andes', 'La Vuelta de Obligado', 'A'),
('Belgrano y La Bandera', '¿En qué histórica batalla de 1812 Belgrano logró frenar el avance realista?', 'Batalla de San Lorenzo', 'Batalla de Tucumán', 'Batalla de Chacabuco', 'B'),

-- Próceres y Educación General (8 preguntas únicas)
('Próceres y Educación', '¿A quién se lo llama "El padre del aula"?', 'Domingo F. Sarmiento', 'José de San Martín', 'Juan B. Alberdi', 'A'),
('Próceres y Educación', '¿En qué provincia nació Sarmiento?', 'San Juan', 'Mendoza', 'Buenos Aires', 'A'),
('Próceres y Educación', '¿Qué prócer cruzó los Andes y fomentó crear bibliotecas públicas?', 'José de San Martín', 'Mariano Moreno', 'Bernardino Rivadavia', 'A'),
('Próceres y Educación', '¿Quién fundó el diario "Gazeta de Buenos Ayres" en 1810?', 'Cornelio Saavedra', 'Mariano Moreno', 'Juan José Castelli', 'B'),
('Próceres y Educación', '¿Dónde se fundó la primera Escuela Normal de Maestros?', 'Córdoba', 'Paraná', 'Rosario', 'B'),
('Próceres y Educación', '¿Qué fecha se eligió para celebrar el Día del Maestro en honor a Sarmiento?', '11 de septiembre', '20 de junio', '25 de mayo', 'A'),
('Próceres y Educación', '¿Bajo qué presidencia se aprobó la Ley 1420 de educación común?', 'Julio A. Roca', 'Bartolomé Mitre', 'Nicolás Avellaneda', 'A'),
('Próceres y Educación', '¿Qué pionera de la educación fue gran colaboradora de Sarmiento?', 'Juana Azurduy', 'Mariquita Sánchez', 'Juana Manso', 'C'),

-- Técnica 32 CABA (5 preguntas)
('Técnica 32 CABA', '¿Qué nombre completo lleva nuestra Escuela Técnica N° 32?', 'Ing. Otto Krause', 'Gral. José de San Martín', 'Osvaldo Magnasco', 'B'),
('Técnica 32 CABA', '¿En qué barrio porteño está ubicada la ET 32?', 'Almagro', 'Chacarita', 'Colegiales', 'B'),
('Técnica 32 CABA', '¿Cuántos años en total dura la secundaria en nuestra escuela técnica?', '5 años', '6 años', '7 años', 'B'),
('Técnica 32 CABA', '¿Qué fecha se festeja en las escuelas técnicas todos los 15 de noviembre?', 'Día del Estudiante', 'Día del Egresado', 'Día de la Educación Técnica', 'C');


--
-- Volcado de datos para la tabla `albums`
--

INSERT INTO `albums` (`id`, `name`, `total_stickers`, `cover_img`, `back_cover_img`, `page_bg_p1`, `page_bg_p2`, `page_bg_p3`, `page_bg_p4`, `page_bg_p5`, `honor_page_1_bg`, `honor_page_2_bg`, `pack_img`, `sticker_back_img`, `sticker_frame_border_img`, `is_active`, `created_at`) VALUES
(1, 'Camino al 20 de Junio', 50, '1-gIw1uzOmibo_5FEZ34F1tYnq98DxLcK', '1GZoYxmomkeNWv1So7qYvKYCjvrLaRgPJ', '1WKw8lmtFvG9RrWbtRF2DEQdarjJ8HZMb', '1YmA-YfgrVGU6_pMWqAHaJDXesKvXxW59', '1Ve9Ficbc2oEJst6M53uQQLigcL0HKY5F', NULL, NULL, '1HlzYcADScCmYCGvUgwg8MLdgVL5VUtem', '1lTRJIJp_QE-EDoBuToIn7Jwp_x_bhS2J', '143zLAvTrwa593hmbCgFARYxVfbarAkNN', '1EtwTxHLPDG4jXQDciZQIbIlbCEvW0WCO', '12PgvKhA0k2FUrwcGJ27MyXwZ3UtutIHb', 1, '2026-05-31 06:08:27');


COMMIT;