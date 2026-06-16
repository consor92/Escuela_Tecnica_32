# Álbum 32: Camino al 20 de Junio - Registro de Cambios y Arquitectura

## 1. Sistema de Mantenimiento y Control de Acceso
- **Restricción Horaria Automática:** El sistema bloquea el acceso a alumnos de **22:00 PM a 08:00 AM** (Zona Horaria: America/Argentina/Buenos_Aires).
- **Modo Mantenimiento Manual:** Activación desde el panel para bloquear el sitio completamente.
- **Acceso Administrativo (Bypass):** Los administradores pueden saltar el bloqueo usando la URL `index.php?admin_mode=1`, lo que activa un bypass de sesión.
- **Arquitectura de Redirección:** Se eliminó la lógica de redirección interna de `maintenance.php` para prevenir errores de `ERR_TOO_MANY_REDIRECTS`, centralizando toda la inteligencia en `checkMaintenance($pdo)`.

## 2. Podio y Cuadro de Honor
- **Lógica de Podio Dinámica:** 
    - **Modo Global:** Muestra a los 3 alumnos más rápidos en completar el álbum en toda la escuela.
    - **Modo Turnos (TM, TT, TV):** Muestra al primer alumno de cada turno (Mañana, Tarde, Vespertino), ordenados entre sí por tiempo de finalización.
- **Gestión de Turnos:** Nueva tabla `course_shifts` para asociar cada curso (ej: 4°3) con su turno correspondiente. Los cambios se sincronizan con todos los alumnos del curso.
- **Métricas de Rendimiento:** El podio ahora calcula y muestra el **"Tiempo Total"** (duración en horas y minutos desde el registro hasta el completado).

## 3. Economía del Juego y Recompensas
- **Cooldowns Dinámicos:** Los administradores pueden configurar el tiempo de espera para QRs y Trivias directamente desde el panel (en horas).
- **Premios Variables en QR:** El escaneo de QRs ahora otorga entre **1 y 5 sobres** basándose en las probabilidades configuradas para los códigos de profesores.
- **Bonus de Canje:** Nueva probabilidad configurable (0-100%) para obtener sobres extra al canjear figuritas repetidas.
- **Happy Hour:** Alerta visual pulsante en el proceso de escaneo cuando el evento está activo.

## 4. Gestión de Seguridad y Usuarios
- **Perfil de Alumno:** Botón 👤 en el dashboard que permite ver datos personales y cambiar la contraseña actual.
- **Reset Administrativo:** Función de reset de clave para el administrador que genera una clave aleatoria de **8 números**, visible una sola vez.
- **Autogestión Admin:** Botón de llave (🔑) en el Panel Maestro para que el administrador cambie su propia clave.

## 5. Mejoras en Interfaz de Usuario (UI)
- **Unificación de Contadores:** Uso de la **Burbuja Dorada Flotante** para los conteos de sobres tanto en el Dashboard como en los resultados de QR.
- **Sincronización de Animaciones:** El sobre del Dashboard ahora rebota junto con su burbuja de conteo para mayor dinamismo visual.
- **Apertura Focalizada:** Se eliminó la burbuja de conteo en la vista `abrir_sobres.php` para centrar la atención únicamente en el sobre y su apertura.
- **Experiencia de Recompensa:** Pantalla de "Botín Logrado" con animaciones de sobres, badges de cantidad y efectos de confeti.
- **Limpieza de Iconografía:** Eliminación de emojis genéricos (🚀) y del icono de caja (📦) en el botón de apertura para un diseño más sobrio y profesional.
- **Optimización de Scroll:** Implementación de scroll interno invisible en modales pesados (como el Podio) para mantener la limpieza visual.

## 6. Base de Datos (Actualizaciones v7.0)
- **Tabla `course_shifts`:** Mapeo de cursos a turnos escolares.
- **Columna `shift` en `users`:** Almacenamiento denormalizado para ## 6. Roles de Usuario y Gestión
- **Sistema Multirrol:** Soporte para Alumno, Docente y Admin.
- **Panel Docente:** Vista simplificada para que los profesores puedan:
    - Ver el historial de códigos promocionales otorgados por el administrador.
    - Blanquear contraseñas de cualquier alumno (reseteo a '123456') independientemente del curso.
- **Restricciones de Juego:** Los roles 'Docente' y 'Admin' están restringidos de las mecánicas de juego (apertura de sobres, álbum) para mantener la integridad de la competencia.
- **Documentación de Base de Datos:** Columna `role` añadida a la tabla `users`.
