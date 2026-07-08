# Plan del Sistema de Asistencia

## Resumen

Nuevo subsistema dentro de `scrum_eval` para gestión completa de asistencia escolar:
cursos, horarios, docentes, preceptores, referentes, alumnos, toma de asistencia diaria,
cómputo de horas, notificaciones internas e importación de datos legacy.

---

## 1. Extensiones a la tabla `users`

Se agregan las siguientes columnas a la tabla `users` de `scrum_eval`:

```sql
ALTER TABLE users
  ADD COLUMN legacy_id INT NULL,
  ADD COLUMN dni VARCHAR(20) NULL,
  ADD COLUMN telefono VARCHAR(60) NULL,
  ADD COLUMN fecha_nacimiento DATE NULL,
  ADD COLUMN direccion VARCHAR(255) NULL,
  ADD COLUMN cuil VARCHAR(50) NULL,
  ADD COLUMN nacionalidad VARCHAR(200) NULL;
```

### Roles (`role_id`)

| role_id | Rol | Descripción |
|---------|-----|-------------|
| 1 | Admin | Acceso completo al sistema |
| 2 | Alumno | Panel existente en `/dashboard` con nueva pestaña de asistencia |
| 3 | Docente | Toma la asistencia diaria de sus cursos |
| 4 | Preceptor | Solo lectura: ve asistencias, no edita |
| 5 | Referente | Solo lectura: ve seguimiento global, datos personales, exporta planillas |

---

## 2. Nuevas tablas en `scrum_eval`

### `asis_especialidades`

```sql
CREATE TABLE asis_especialidades (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  activo TINYINT(1) DEFAULT 1
);
```

Ej: "Mecánica", "Computación", "Electrónica", "Informática"

### `asis_cursos`

```sql
CREATE TABLE asis_cursos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT NULL,
  anio INT NOT NULL,
  especialidad_id INT NOT NULL,
  division VARCHAR(10) NOT NULL,
  turno VARCHAR(40) NOT NULL,       -- Mañana / Tarde / Vespertino
  activo TINYINT(1) DEFAULT 1,
  FOREIGN KEY (especialidad_id) REFERENCES asis_especialidades(id)
);
```

### `asis_docentes_curso`

Relación M:N entre cursos y docentes/preceptores.

```sql
CREATE TABLE asis_docentes_curso (
  id INT AUTO_INCREMENT PRIMARY KEY,
  curso_id INT NOT NULL,
  user_id INT NOT NULL,
  rol ENUM('docente', 'preceptor') NOT NULL,
  FOREIGN KEY (curso_id) REFERENCES asis_cursos(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_preceptor_curso (curso_id, rol)  -- solo 1 preceptor por curso
);
```

**Reglas:**
- Varios docentes por curso (sin restricción)
- Solo 1 preceptor por curso (lo controla el UNIQUE KEY con rol='preceptor')
- El referente NO se asigna por curso (es role_id=5 y ve todos los cursos)

### `asis_horarios`

Horarios regulares de cada curso.

```sql
CREATE TABLE asis_horarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  curso_id INT NOT NULL,
  dia_semana TINYINT NOT NULL,        -- 1=lunes, 2=martes ... 7=domingo
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  hs_reloj DECIMAL(5,2) NOT NULL,     -- horas reloj que contabiliza este bloque
  hs_catedra DECIMAL(5,2) NOT NULL,   -- horas cátedra (40min = 1 cátedra)
  FOREIGN KEY (curso_id) REFERENCES asis_cursos(id) ON DELETE CASCADE
);
```

### `asis_alumnos_curso`

Inscripción de alumnos a cursos.

```sql
CREATE TABLE asis_alumnos_curso (
  id INT AUTO_INCREMENT PRIMARY KEY,
  curso_id INT NOT NULL,
  user_id INT NOT NULL,
  fecha_inscripcion DATE NOT NULL DEFAULT (CURDATE()),
  activo TINYINT(1) DEFAULT 1,
  FOREIGN KEY (curso_id) REFERENCES asis_cursos(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_alumno_curso (curso_id, user_id)
);
```

### `asis_registros`

**Tabla principal de asistencia.** Cada fila = un alumno en un día específico con su estado.

```sql
CREATE TABLE asis_registros (
  id INT AUTO_INCREMENT PRIMARY KEY,
  alumno_curso_id INT NOT NULL,
  fecha DATE NOT NULL,
  estado ENUM('presente', 'ausente', 'tardia', 'retiro_anticipado') NOT NULL,
  hora_ingreso TIME NULL,
  hora_egreso TIME NULL,
  correccion_manual TINYINT(1) DEFAULT 0,
  created_by INT NOT NULL,            -- user_id del docente que cargó
  justificacion VARCHAR(255) NULL,
  FOREIGN KEY (alumno_curso_id) REFERENCES asis_alumnos_curso(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id),
  UNIQUE KEY unique_asistencia_dia (alumno_curso_id, fecha)
);
```

### `asis_faltas`

Cómputo de faltas con ponderación (1, 1/2, 1/4). Separado del registro de asistencia.

```sql
CREATE TABLE asis_faltas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  alumno_curso_id INT NOT NULL,
  fecha DATE NOT NULL,
  tipo_falta DECIMAL(3,2) NOT NULL,   -- 1.00, 0.50, 0.25
  motivo VARCHAR(255) NULL,
  FOREIGN KEY (alumno_curso_id) REFERENCES asis_alumnos_curso(id) ON DELETE CASCADE,
  UNIQUE KEY unique_falta (alumno_curso_id, fecha)
);
```

### `asis_eventos_especiales`

Salidas didácticas, actividades especiales.

```sql
CREATE TABLE asis_eventos_especiales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  curso_id INT NOT NULL,
  fecha DATE NOT NULL,
  descripcion VARCHAR(255) NOT NULL,
  horas_reloj DECIMAL(5,2) NOT NULL,
  horas_catedra DECIMAL(5,2) NOT NULL,
  FOREIGN KEY (curso_id) REFERENCES asis_cursos(id) ON DELETE CASCADE
);
```

### `asis_ausencias_docente`

Días en que no hubo clase por ausencia del docente.

```sql
CREATE TABLE asis_ausencias_docente (
  id INT AUTO_INCREMENT PRIMARY KEY,
  curso_id INT NOT NULL,
  fecha DATE NOT NULL,
  motivo VARCHAR(255) NULL,
  FOREIGN KEY (curso_id) REFERENCES asis_cursos(id) ON DELETE CASCADE,
  UNIQUE KEY unique_ausencia (curso_id, fecha)
);
```

### `asis_dias_no_laborables`

Feriados, paros, suspensiones. Si `aplica_todos` = 1, afecta a todos los cursos.

```sql
CREATE TABLE asis_dias_no_laborables (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fecha DATE NOT NULL,
  motivo VARCHAR(255) NOT NULL,
  tipo VARCHAR(50) DEFAULT 'feriado',
  aplica_todos TINYINT(1) DEFAULT 1,
  curso_id INT NULL,
  FOREIGN KEY (curso_id) REFERENCES asis_cursos(id) ON DELETE CASCADE,
  UNIQUE KEY unique_dia_no_laborable (fecha, curso_id)
);
```

### `asis_parametros`

Configuración general del sistema de asistencia.

```sql
CREATE TABLE asis_parametros (
  clave VARCHAR(50) PRIMARY KEY,
  valor VARCHAR(255) NOT NULL
);
```

**Valores iniciales:**
| clave | valor | descripción |
|-------|-------|-------------|
| `minimo_anual_hs_catedra` | `216` | Mínimo de horas cátedra para aprobar |
| `catedra_minutos` | `40` | Minutos que tiene 1 hora cátedra |
| `falta_completa` | `1.00` | Ponderación de falta por ausente |
| `falta_tardia` | `0.50` | Ponderación de falta por tardanza |
| `falta_retiro` | `0.25` | Ponderación de falta por retiro anticipado |

### `asis_notificaciones`

Notificaciones internas del sistema (campanita en el Header).

```sql
CREATE TABLE asis_notificaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  titulo VARCHAR(100) NOT NULL,
  mensaje TEXT NOT NULL,
  tipo ENUM('alerta', 'info', 'advertencia') DEFAULT 'info',
  leida TINYINT(1) DEFAULT 0,
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### `asis_notificaciones_config`

Configuración de envío de notificaciones por email por curso.

```sql
CREATE TABLE asis_notificaciones_config (
  id INT AUTO_INCREMENT PRIMARY KEY,
  curso_id INT NOT NULL,
  email_destinatarios JSON NOT NULL,   -- ["email1","email2"]
  hora_envio TIME NULL,
  activo TINYINT(1) DEFAULT 0,
  FOREIGN KEY (curso_id) REFERENCES asis_cursos(id) ON DELETE CASCADE
);
```

### `asis_matriculacion_codigos`

Códigos para que los alumnos se auto-inscriban a un curso.

```sql
CREATE TABLE asis_matriculacion_codigos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  curso_id INT NOT NULL,
  codigo VARCHAR(20) NOT NULL UNIQUE,
  activo TINYINT(1) DEFAULT 1,
  usos_maximos INT DEFAULT 0,          -- 0 = ilimitado
  usos_actuales INT DEFAULT 0,
  FOREIGN KEY (curso_id) REFERENCES asis_cursos(id) ON DELETE CASCADE
);
```

---

## 3. Rutas del frontend

| Ruta | role_id | Componente | Acceso |
|------|---------|------------|--------|
| `/admin/asistencia` | 1 | AdminAsistencia | CRUD completo |
| `/docente` | 3 | DocentePanel | Toma de asistencia |
| `/preceptor` | 4 | PreceptorPanel | Solo lectura |
| `/referente` | 5 | ReferentePanel | Solo lectura + exportación |
| `/dashboard` (pestaña) | 2 | AlumnoAsistencia | Sección dentro del panel existente |

### Navegación (Header)

El Header debe mostrar links dinámicamente según `role_id`:

```
role_id=1 (Admin):     Admin | Jira | Asistencia
role_id=3 (Docente):   Docente (link a /docente)
role_id=4 (Preceptor): Preceptor (link a /preceptor)
role_id=5 (Referente): Referente (link a /referente)
role_id=2 (Alumno):    Dashboard | Profile (sin cambios, se agrega pestaña interna)
```

**TODOS los roles** deben ver la campanita de notificaciones en el Header.

---

## 4. Sistema de Notificaciones Internas

### Funcionamiento

- Tabla `asis_notificaciones` almacena todas las notificaciones
- El Header consulta las no leídas y muestra un badge con el conteo
- Al clickear la campanita se despliega un dropdown con las últimas N notificaciones
- Se puede marcar como leída individualmente o "marcar todas como leídas"

### Generación automática

El sistema genera notificaciones automáticas:
- "Tu asistencia del día XX/XX/XXXX fue registrada como [estado]"
- "Alerta: llevás X horas acumuladas de las 216 necesarias (X%)"
- "Tenés X faltas registradas en el bimestre"

### Generación manual

- **Docente**: puede notificar a los alumnos de su curso
- **Preceptor**: puede notificar a los alumnos de su curso
- **Referente**: puede notificar por curso o globalmente

---

## 5. Módulo de Cómputo (server action)

Servicio que calcula por alumno + bimestre (usa `scrum_bimestres_config`):

### Cálculo de días teóricos

```
dias_teoricos = contar, para cada día en el rango del bimestre,
  si ese día de semana está en asis_horarios del curso
  y no está en asis_dias_no_laborables
  y no está en asis_ausencias_docente
```

### Cálculo de horas

```
Para cada día con asistencia = 'presente':
  horas_reloj += hs_reloj del bloque horario de ese día
  horas_catedra += hs_catedra del bloque horario de ese día

Para cada asis_eventos_especiales del curso en el bimestre:
  horas_reloj += horas_reloj del evento
  horas_catedra += horas_catedra del evento
```

### Alerta

```
Si horas_catedra_acumuladas < 216 → mostrar alerta con % de cumplimiento
```

### Cómputo de faltas

```
Para cada asis_faltas en el bimestre:
  total_faltas += tipo_falta

Mostrar: faltas del bimestre, faltas acumuladas en el año
```

---

## 6. Importación desde DB Legacy (`epiz_27864677_encuentro`)

### Propósito

Migración única de datos desde el sistema legacy hacia las tablas nuevas de `scrum_eval`.
Es una herramienta de importación, no hay referencias a la DB legacy en el código del nuevo sistema.

### Pool de conexión

Archivo `src/lib/db-encuentro.ts` con variables de entorno configurables:

```
DB_ENCUENTRO_HOST=localhost
DB_ENCUENTRO_USER=root
DB_ENCUENTRO_PASSWORD=
DB_ENCUENTRO_NAME=epiz_27864677_encuentro
```

### Lo que importa

| Legacy | Destino | Lógica |
|--------|---------|--------|
| `usuarios` | `users` | Match por nombre+apellido + dni → actualiza o crea |
| `curso` | `asis_especialidades` + `asis_cursos` + `asis_docentes_curso` + `asis_horarios` | Desglosa el curso legacy en las tablas nuevas |
| `asistencia` | `asis_registros` + `asis_faltas` | Convierte registro legacy a estado + falta |

### Mapeo legacy → nuevo

**usuarios → users:**
- `id` → `legacy_id`
- `usuario` → `username`
- `nombre` → `first_name`
- `apellido` → `last_name`
- `dni` → `dni`
- `email` → `email`
- `telefono` → `telefono`
- `nacimiento` → `fecha_nacimiento`
- `direccion` → `direccion`
- `cuil` → `cuil`
- `nacionalidad` → `nacionalidad`
- `pwd` → `password_md5` (se genera un hash por defecto si no existe)
- `rol` → `role_id` (mapeo: 0/1 → 2 alumno, 2 → 1 admin)
- `curso` → se crea registro en `asis_alumnos_curso`

**curso → asis_cursos:**
- `nombre_curso` → `nombre` (se puede dividir para extraer especialidad y año)
- `descripcion_curso` → `descripcion`
- `anio` → `anio`
- `turno` → `turno`
- `profesor` / `profesor2` → `asis_docentes_curso` con rol='docente'
- `lun`..`dom` → `asis_horarios` (1 registro por día activo, con hora_inicio=00:00, hora_fin=23:59 como default)

**asistencia → asis_registros:**
- `fecha` → `fecha`
- `usuario` → se busca `alumno_curso_id` por equivalencia legacy_id
- `estado` → como el legacy solo tiene fecha (sin estado), se importa como 'presente' por defecto
- Se crea también registro en `asis_faltas` con 0 por defecto (no había datos de faltas en legacy)

### Control de importación

- Se crea una tabla `asis_import_log` para registrar cada importación:
  ```sql
  CREATE TABLE asis_import_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha_importacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    tabla_origen VARCHAR(50),
    registros_importados INT,
    registros_omitidos INT
  );
  ```
- Re-ejecutable: si `legacy_id` ya existe → se salta o actualiza según corresponda

---

## 7. Orden de implementación

| # | Paso | Archivos involucrados |
|---|------|-----------------------|
| 1 | **Migración DB**: ALTER TABLE users + CREATE TABLE asis_* | `scripts/migracion_asistencia.sql` |
| 2 | Pool conexión legacy | `src/lib/db-encuentro.ts`, `.env` |
| 3 | Esqueleto de rutas + navegación dinámica | `src/middleware.ts`, `src/components/Header.tsx`, rutas nuevas |
| 4 | **Sistema de notificaciones** | `src/app/api/notificaciones/`, campanita en Header |
| 5 | Admin: CRUD especialidades, cursos, horarios, docentes | `/admin/asistencia/page.tsx` + componentes |
| 6 | Admin: inscripción de alumnos + códigos matriculación | mismo panel admin |
| 7 | **Docente**: toma de asistencia diaria | `/docente/page.tsx` |
| 8 | Admin: eventos especiales, ausencias docente, días no laborables | panel admin |
| 9 | **Admin**: cómputo de horas y reportes | server action `calcular_horas.ts` |
| 10 | **Preceptor**: panel read-only | `/preceptor/page.tsx` |
| 11 | **Referente**: panel read-only + exportación | `/referente/page.tsx` |
| 12 | **Alumno**: pestaña en dashboard | `DashboardViews.tsx` + server action |
| 13 | **Importación legacy** | panel admin + `importar_legacy.ts` |

---

## 8. Notas importantes

1. **Asistencias ≠ Horas**: son dos conceptos separados. Las faltas se cuentan en 1, ½, ¼. Las horas se acumulan hacia la meta de 216 hs cátedra.
2. **Docente toma asistencia**: el preceptor y referente solo ven datos, no editan.
3. **El referente es de la escuela**: no está asignado a ningún curso, ve todos los datos globales.
4. **El alumno usa el dashboard existente**: no se crea un nuevo panel, solo se agrega una pestaña "Asistencia" a `DashboardViews.tsx`.
5. **La DB legacy se usa solo para importar**: el nuevo sistema es autónomo, no referencias al legacy en producción.
6. **Notificaciones**: el sistema más confiable son las notificaciones internas (campanita). El email es secundario.
7. **Los horarios almacenan hs_reloj y hs_cátedra** directamente, aunque también se puedan recalcular desde hora_inicio y hora_fin.
