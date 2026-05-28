-- =============================================
-- SCRIPT DE INICIALIZACIÓN DEFINITIVO: ÁLBUM 32
-- Versión: 4.1 (RESTAURACIÓN DE DATOS COMPLETA)
-- =============================================

CREATE DATABASE IF NOT EXISTS album_32 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE album_32;

-- 1. Tabla de Configuraciones Globales
CREATE TABLE IF NOT EXISTS settings (
    `key` VARCHAR(50) PRIMARY KEY,
    `value` TEXT NOT NULL
) ENGINE=InnoDB;

INSERT IGNORE INTO settings (`key`, `value`) VALUES ('qr_base_url', 'http://localhost/figus/');

-- 2. Tabla de Usuarios
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    course VARCHAR(20) NOT NULL,
    packs_available INT DEFAULT 0,
    album_completed TINYINT(1) DEFAULT 0,
    completed_at DATETIME NULL,
    last_trivia_at DATETIME NULL,
    is_admin TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. Tabla de Figuritas
CREATE TABLE IF NOT EXISTS stickers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    number INT NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    rarity ENUM('common', 'uncommon', 'rare', 'holo', 'gold') NOT NULL,
    external_url VARCHAR(255) NOT NULL
) ENGINE=InnoDB;

-- 4. Inventario de Usuarios
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

-- 5. Estaciones QR
CREATE TABLE IF NOT EXISTS qr_stations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    display_name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) NOT NULL UNIQUE,
    type ENUM('pack', 'trivia') DEFAULT 'pack',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 6. Auditoría de Sobres
CREATE TABLE IF NOT EXISTS audit_packs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    source_type ENUM('qr', 'trivia', 'promo', 'trade', 'admin') NOT NULL,
    source_id VARCHAR(100) NULL,
    amount INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. Registro de Escaneos QR
CREATE TABLE IF NOT EXISTS qr_scans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    qr_station_id INT NOT NULL,
    scanned_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (qr_station_id) REFERENCES qr_stations(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8. Catálogo de Trivias
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

-- 9. Registro de Trivias Respondidas
CREATE TABLE IF NOT EXISTS user_trivias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    trivia_id INT NOT NULL,
    answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY (user_id, trivia_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (trivia_id) REFERENCES trivias(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 10. Códigos Promocionales
CREATE TABLE IF NOT EXISTS promo_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    packs_reward INT DEFAULT 1,
    used_by_count INT DEFAULT 0,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 11. Uso de Códigos por Usuario
CREATE TABLE IF NOT EXISTS user_promo_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    code_id INT NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY (user_id, code_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (code_id) REFERENCES promo_codes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================
-- POBLACIÓN DE DATOS (RESTAURADA)
-- =============================================

-- Usuarios base (Password: '123456')
INSERT IGNORE INTO users (username, password, full_name, course, packs_available, is_admin) VALUES 
('admin', '$2y$10$8V9p1lUuYJ7nQzK.v1H1Oe/9zZ7qK6Yw7n/rS2X/y2X/y2X/y2X/y', 'Administrador General', 'Sistemas', 100, 1),
('alumno1', '$2y$10$8V9p1lUuYJ7nQzK.v1H1Oe/9zZ7qK6Yw7n/rS2X/y2X/y2X/y2X/y', 'Juan Pérez', '4to 1ra', 50, 0);

-- Catálogo de 50 Figuritas
INSERT IGNORE INTO stickers (number, name, description, rarity, external_url) VALUES
(1, 'Manuel Belgrano (Retrato)', 'Abogado, economista y gran estratega militar argentino. Creador de nuestra bandera nacional.', 'gold', 'https://picsum.photos/seed/stk1/300/400'),
(2, 'Bandera de Macha', 'Una de las banderas más antiguas que se conservan de la época de la independencia.', 'common', 'https://picsum.photos/seed/stk2/300/400'),
(3, 'Cabildo de 1810', 'Lugar histórico donde se gestó el primer gobierno patrio en la Semana de Mayo.', 'uncommon', 'https://picsum.photos/seed/stk3/300/400'),
(4, 'Éxodo Jujeño', 'Belgrano lideró el retiro del pueblo jujeño para no dejar recursos al avance realista.', 'rare', 'https://picsum.photos/seed/stk4/300/400'),
(5, 'Batalla de Tucumán', 'Triunfo clave de Belgrano que frenó el avance realista en el norte argentino.', 'common', 'https://picsum.photos/seed/stk5/300/400'),
(6, 'Batalla de Salta', 'Victoria donde se utilizó por primera vez la bandera celeste y blanca en combate.', 'uncommon', 'https://picsum.photos/seed/stk6/300/400'),
(7, 'Rosario: Creación de la Bandera', 'En las orillas del Paraná, Belgrano enarboló por primera vez nuestro símbolo patrio.', 'rare', 'https://picsum.photos/seed/stk7/300/400'),
(8, 'Retrato Juvenil Belgrano', 'Imagen que muestra a Belgrano durante sus estudios en España y su formación humanista.', 'common', 'https://picsum.photos/seed/stk8/300/400'),
(9, 'La Escarapela', 'Símbolo distintivo creado por Belgrano para identificar a sus tropas en la lucha.', 'uncommon', 'https://picsum.photos/seed/stk9/300/400'),
(10, 'Belgrano en España', 'Años de formación intelectual donde Belgrano absorbió las ideas de la Ilustración.', 'rare', 'https://picsum.photos/seed/stk10/300/400'),
(11, 'Consulado de Comercio', 'Institución donde Belgrano impulsó la industria, el agro y la educación pública.', 'uncommon', 'https://picsum.photos/seed/stk11/300/400'),
(12, 'Invasiones Inglesas', 'Belgrano participó activamente en la defensa de Buenos Aires frente al invasor británico.', 'common', 'https://picsum.photos/seed/stk12/300/400'),
(13, 'Expedición al Paraguay', 'Difícil misión militar y política encargada por la Junta tras la revolución de mayo.', 'rare', 'https://picsum.photos/seed/stk13/300/400'),
(14, 'Tambor de Tacuarí', 'Niño soldado que alentó a las tropas de Belgrano con su tambor durante el combate.', 'common', 'https://picsum.photos/seed/stk14/300/400'),
(15, 'Encuentro con San Martín', 'Momento histórico donde los dos grandes próceres coordinaron la defensa del norte.', 'uncommon', 'https://picsum.photos/seed/stk15/300/400'),
(16, 'Posta de Yatasto', 'Lugar legendario del abrazo fraternal entre Belgrano y el general José de San Martín.', 'rare', 'https://picsum.photos/seed/stk16/300/400'),
(17, 'Ejército del Norte', 'Fuerza militar comandada por Belgrano en las campañas libertadoras del Alto Perú.', 'uncommon', 'https://picsum.photos/seed/stk17/300/400'),
(18, 'Belgrano Periodista', 'Fundador del Telégrafo Mercantil, Belgrano usó la pluma para difundir ideas de progreso.', 'common', 'https://picsum.photos/seed/stk18/300/400'),
(19, 'Correo de Comercio', 'Semanario fundado por Belgrano para debatir sobre economía, agricultura y educación.', 'holo', 'https://picsum.photos/seed/stk19/300/400'),
(20, 'Donación de Premios', 'Belgrano donó sus 40.000 pesos de premios para la creación de cuatro escuelas públicas.', 'uncommon', 'https://picsum.photos/seed/stk20/300/400'),
(21, '4 Escuelas Públicas', 'El legado educativo de Belgrano: escuelas en Tarija, Jujuy, Tucumán y Santiago del Estero.', 'rare', 'https://picsum.photos/seed/stk21/300/400'),
(22, 'Constitución de 1819', 'Participación de Belgrano en los debates institucionales sobre la organización del país.', 'common', 'https://picsum.photos/seed/stk22/300/400'),
(23, 'Fallecimiento de Belgrano', 'El 20 de junio de 1820 murió en la pobreza absoluta, fiel a sus ideales de servicio.', 'holo', 'https://picsum.photos/seed/stk23/300/400'),
(24, 'Últimas Palabras', '"Ay, Patria mía", suspiros finales de un hombre que entregó su vida por la nación.', 'uncommon', 'https://picsum.photos/seed/stk24/300/400'),
(25, 'Monumento a la Bandera', 'Emblemático sitio en Rosario que homenajea la creación de nuestro primer pabellón.', 'common', 'https://picsum.photos/seed/stk25/300/400'),
(26, 'E.T. Nº 32 Logo', 'Identidad de nuestra querida escuela técnica unida al sentimiento patriótico.', 'rare', 'https://picsum.photos/seed/stk26/300/400'),
(27, 'Taller de Carpintería', 'Donde se forja la técnica y el oficio con la nobleza de la madera. Orgullo de la 32.', 'uncommon', 'https://picsum.photos/seed/stk27/300/400'),
(28, 'Taller de Mecánica', 'Precisión y fierros: los alumnos de la 32 aprendiendo el motor del desarrollo.', 'rare', 'https://picsum.photos/seed/stk28/300/400'),
(29, 'Taller de Electricidad', 'Circuitos y energía: la potencia técnica de nuestros estudiantes en acción.', 'uncommon', 'https://picsum.photos/seed/stk29/300/400'),
(30, 'Taller de Electrónica', 'Innovación y microcontroladores: el futuro tecnológico de la E.T. 32.', 'holo', 'https://picsum.photos/seed/stk30/300/400'),
(31, 'Dibujo Técnico', 'La base de todo proyecto: planos y precisión trazados por manos expertas.', 'common', 'https://picsum.photos/seed/stk31/300/400'),
(32, 'Día de la Técnica', 'Celebración de la educación técnica, motor fundamental de nuestra Argentina.', 'uncommon', 'https://picsum.photos/seed/stk32/300/400'),
(33, 'Formación Ética', 'Educando ciudadanos comprometidos con el respeto y los valores belgranianos.', 'rare', 'https://picsum.photos/seed/stk33/300/400'),
(34, 'Educación Física', 'Mente sana en cuerpo sano: el deporte y la salud en nuestra comunidad escolar.', 'uncommon', 'https://picsum.photos/seed/stk34/300/400'),
(35, 'Laboratorio de Informática', 'Sistemas e informática: la especialidad de vanguardia de la técnica 32.', 'common', 'https://picsum.photos/seed/stk35/300/400'),
(36, 'Belgrano y la Educación', 'Para Belgrano, la educación era el fundamento de la libertad de los pueblos.', 'rare', 'https://picsum.photos/seed/stk36/300/400'),
(37, 'Reglamento de 1813', 'Instrucciones pioneras para el fomento de la agricultura y la industria nacional.', 'holo', 'https://picsum.photos/seed/stk37/300/400'),
(38, 'Misión Diplomática Londres', 'Belgrano buscó el reconocimiento de nuestra independencia ante las potencias europeas.', 'common', 'https://picsum.photos/seed/stk38/300/400'),
(39, 'Escudo de Armas Belgrano', 'Blasón de la familia Belgrano, símbolo de su linaje y servicio a la corona y la patria.', 'uncommon', 'https://picsum.photos/seed/stk39/300/400'),
(40, 'Día del Graduado Cs Ec', 'En honor al primer economista patrio: Manuel Belgrano, pionero del pensamiento económico.', 'rare', 'https://picsum.photos/seed/stk40/300/400'),
(41, 'Proyecto Monarquía Inca', 'Propuesta de Belgrano para unificar el continente bajo un descendiente de los Incas.', 'common', 'https://picsum.photos/seed/stk41/300/400'),
(42, 'Congreso de Tucumán', 'Belgrano fue una voz influyente que instó a los congresales a declarar la independencia.', 'uncommon', 'https://picsum.photos/seed/stk42/300/400'),
(43, 'Fachada E.T. 32', 'Nuestra casa de estudios, donde formamos a los técnicos del futuro.', 'rare', 'https://picsum.photos/seed/stk43/300/400'),
(44, 'Patio de Formación', 'Espacio de encuentro de toda la comunidad educativa de la técnica 32.', 'common', 'https://picsum.photos/seed/stk44/300/400'),
(45, 'Himno Nacional', 'Símbolo que junto a la bandera nos une en el sentimiento de libertad.', 'uncommon', 'https://picsum.photos/seed/stk45/300/400'),
(46, '⭐ BELGRANO GOLD ⭐', 'Edición legendaria en honor al sacrificio y honestidad de nuestro máximo prócer.', 'holo', 'https://picsum.photos/seed/stk46/300/400'),
(47, '⭐ BANDERA ARGENTINA ⭐', 'El símbolo máximo de unión y soberanía nacional, creada por Manuel Belgrano.', 'common', 'https://picsum.photos/seed/stk47/300/400'),
(48, '⭐ LIBERTAD ⭐', 'El ideal por el cual Belgrano entregó su vida, su fortuna y su salud.', 'holo', 'https://picsum.photos/seed/stk48/300/400'),
(49, '⭐ INDEPENDENCIA ⭐', 'Grito sagrado que resuena desde 1816 en todo el suelo argentino.', 'gold', 'https://picsum.photos/seed/stk49/300/400'),
(50, '⭐ GRAN PREMIO 3D ⭐', '¡Felicidades! Has completado el álbum. Canjea esta figu por tu impresión 3D.', 'gold', 'https://picsum.photos/seed/stk50/300/400');

-- Catálogo de Trivias
INSERT IGNORE INTO trivias (id, category, question, option_a, option_b, option_c, correct_option) VALUES
(1, 'Historia', '¿En qué ciudad Manuel Belgrano creó la Bandera Nacional?', 'Buenos Aires', 'Rosario', 'Tucumán', 'b'),
(2, 'Institucional', '¿Cómo se llama nuestra escuela Técnica Nº 32?', 'General Belgrano', 'José de San Martín', 'Cornelio Saavedra', 'b'),
(3, 'Historia', '¿Qué batalla ganó Belgrano desobedeciendo las órdenes del Triunvirato?', 'Batalla de Tucumán', 'Batalla de Salta', 'Combate de San Lorenzo', 'a'),
(4, 'Historia', '¿En qué año falleció Manuel Belgrano?', '1810', '1816', '1820', 'c'),
(5, 'Institucional', '¿Cuál es la especialidad principal de nuestra escuela?', 'Agropecuaria', 'Sistemas e Informática', 'Turismo', 'b');

-- Mantenimiento y Resets
UPDATE users SET password = '$2y$10$8V9p1lUuYJ7nQzK.v1H1Oe/9zZ7qK6Yw7n/rS2X/y2X/y2X/y2X/y';
UPDATE users SET packs_available = 100 WHERE username = 'admin';
