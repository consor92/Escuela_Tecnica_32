# 🚀 CONFIGURACIÓN TÉCNICA ESTRATÉGICA - ECOSISTEMA DOCKER

Este documento resume la arquitectura actual de contenedores tras la unificación del proyecto de producción y el sistema Encuesta PP.

---

## 🏗️ 1. ARQUITECTURA DE SERVICIOS (Carpeta `carp`)

El archivo maestro de orquestación reside en `encuesta-pp-react/carp/docker-compose.yml`.

### A. Sistema de Producción (Existente)
- **Servicio:** `frontend`
- **Puerto Externo:** `3000`
- **Puerto Interno:** `3000`
- **Propósito:** Interfaz de usuario original del sistema.

### B. Sistema Encuesta PP (Nuevo)
- **Servicio APP:** `encuesta_app`
- **Puerto Externo:** `3001`
- **Puerto Interno:** `3000` (Next.js Standalone)
- **Contexto de Build:** `..` (Subida de nivel a `encuesta-pp-react`)
- **Servicio DB:** `encuesta_db`
- **Puerto Externo DB:** `3307`
- **Puerto Interno DB:** `3306` (MySQL 8.0)

---

## 💾 2. PERSISTENCIA Y VOLÚMENES
- **Base de Datos:** Volumen `encuesta_db_data`.
- **Inicialización:** El sistema carga automáticamente `encuesta-pp-react/init.sql` al crear el contenedor de base de datos por primera vez.
- **Archivos:** `users.csv` se copia dentro del contenedor `encuesta_app` para permitir la función de **Restaurar (Default)**.

---

## 🔧 3. CONFIGURACIÓN DE CONEXIÓN (.env)
Para desarrollo local fuera de Docker, usar en `encuesta-pp-react/.env.local`:
```env
DB_HOST=localhost
DB_PORT=3307
DB_USER=admin
DB_PASSWORD=admin123
DB_NAME=scrum_eval
JWT_SECRET=super-secret-key
```

---

## 🚀 4. PROTOCOLO DE INICIO UNIFICADO
Para levantar ambos mundos (Producción + Encuesta PP):
```bash
cd encuesta-pp-react/carp
docker-compose up -d --build
```

---

## 📍 5. PUNTOS DE ACCESO
- **Producción:** [http://localhost:3000](http://localhost:3000)
- **Encuesta PP:** [http://localhost:3001](http://localhost:3001)
- **Gestión DB (Externo):** `localhost:3307`

---
**Nota:** El `Dockerfile` en `encuesta-pp-react` NO debe modificarse en sus puertos internos (3000); la organización de tráfico se maneja exclusivamente desde el `docker-compose.yml` en la carpeta `carp`.
