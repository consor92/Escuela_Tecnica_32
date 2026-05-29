# Álbum 32: Camino al 20 de Junio - Instrucciones del Proyecto

## Stack Tecnológico
- **Backend:** PHP 8.x (PDO para todas las consultas SQL).
- **Base de Datos:** MySQL (InnoDB).
- **Frontend:** HTML5, CSS3 (Vanilla), JavaScript (Vanilla).
- **Arquitectura:** Monolítica con API interna para fetch.

## Estándares de Código
- **Hosting (InfinityFree/Epizy):**
    - Las imágenes de las figuritas NO se alojan en el servidor local para ahorrar CPU/Ancho de Banda. Usar URLs absolutas.
    - Las peticiones `fetch()` deben incluir headers mínimos y evitar patrones que activen el sistema anti-bot de Epizy (como ráfagas excesivas).
    - Optimizar consultas SQL para minimizar el tiempo de ejecución.
- **Seguridad:** 
    - Uso obligatorio de `password_hash()` y `password_verify()`.
    - Consultas preparadas (Prepared Statements) sin excepción.
    - Sanitización de inputs (`filter_var`, `htmlspecialchars`).
    - Validación de lado del servidor para TODAS las acciones del juego.
- **Estilo CSS:** 
    - Mobile-First.
    - Variables CSS para rarezas (Común, Especial, Holográfica).
    - Animaciones fluidas para el pegado de figuritas y apertura de sobres.
- **Estructura de Archivos:**
    - `/assets`: CSS, JS, Imágenes.
    - `/includes`: Configuración de BD, funciones core, autenticación.
    - `/api`: Endpoints JSON para el frontend.
    - `/admin`: Gestión de trivias y monitoreo.

## Reglas de Negocio
- Rarezas: Común (70%), Poco Común (18%), Rara (8%), Holo (3%), Gold (1%).
- Cooldown QR: 6 horas por `qr_id` por usuario.
- Canje: 10 figuritas repetidas netas = 1 sobre.
- Podio: Basado en `completed_at` (Timestamp más antiguo para completar 50 figus).
