# ET 32 - Plataforma Institucional (v1.1.0)

Este es el repositorio del frontend de la Escuela Técnica N° 32 "Gral. José de San Martín". La aplicación está construida con **Next.js** y está diseñada para ser desplegada mediante **Docker** de forma eficiente y persistente.

## 🚀 Funcionalidades Principales

- **Gestión de Especialidades:** Páginas dinámicas para Automotores, Mecánica y Computación con detalles de planes de estudio y talleres.
- **Organigrama Interactivo:** Visualización de la jerarquía de autoridades y personal docente.
- **Calendario de Eventos y Exámenes:** Sistema de calendario interactivo para fechas importantes.
- **Sección de Noticias y Novedades:** Feed dinámico de noticias con soporte para imágenes y categorías.
- **Gestión de Emergencias:** Página dedicada con protocolos de seguridad y contactos de emergencia.
- **Sistema de Inscripciones:** Información detallada para nuevos ingresantes y descarga de formularios.
- **Banners de Alerta:** Sistema de notificaciones globales en la home para avisos urgentes.
- **Cooperadora e Historia:** Espacios dedicados a la participación de padres y el legado institucional.

## 📂 Estructura del Proyecto

```text
frontend/
├── public/                 # Archivos estáticos (imágenes, PDFs)
│   └── uploads/            # Carpeta persistente para archivos subidos en el servidor
├── src/
│   ├── Components/         # Componentes React reutilizables
│   ├── data/               # Archivos JSON con información estática (autoridades, noticias, etc.)
│   ├── pages/              # Rutas de la aplicación (Next.js Pages Router)
│   └── styles/             # Estilos globales y variables CSS
├── Dockerfile              # Configuración de la imagen de producción (Node 20-alpine)
└── docker-compose.yml      # Configuración de servicios (Frontend + Nginx Proxy)
```

## 🛠️ Desarrollo Local

1. Instalar dependencias:
   ```bash
   npm install --legacy-peer-deps
   ```
2. Correr en modo desarrollo:
   ```bash
   npm run dev
   ```
3. Realizar un Build de prueba:
   ```bash
   npm run build
   ```

## 🐳 Despliegue con Docker (Producción)

El proyecto está configurado para correr detrás de un proxy inverso (**Nginx**) y mantener la persistencia de los archivos en la carpeta `public`.

### Pasos para desplegar:

1. **Mover el archivo Compose:**
   Mover el archivo `frontend/docker-compose.yml` a la raíz del proyecto (un nivel arriba).
2. **Subir cambios a Git:**
   Asegurate de que los cambios en el `Dockerfile` y el `.gitignore` estén en el repo.
3. **Pullear en el Servidor:**
   ```bash
   git pull origin main
   ```
4. **Levantar los Contenedores:**
   ```bash
   docker-compose up --build -d
   ```

### 💾 Persistencia y Git Workflow

- **Imágenes desde Local:** Si agregás imágenes en tu casa dentro de `public/`, hacé commit y push. Al hacer `git pull` en el server, se verán reflejadas automáticamente.
- **Archivos subidos en el Server:** Los archivos que la app guarde en `public/uploads/` persistirán aunque se reinicie el contenedor, gracias al volumen configurado: `- ./frontend/public:/app/public`.
- **Git Ignore:** La carpeta `public/uploads/` está ignorada por Git (excepto el archivo `.gitkeep`) para evitar conflictos al actualizar el código en el servidor.

## ⚙️ Tecnologías Usadas

- **Frontend:** Next.js (React), Framer Motion, React Icons.
- **Despliegue:** Docker, Docker Compose, Nginx.
- **Estilos:** CSS Modules y Variables Globales.

---
*Desarrollado para la Escuela Técnica N° 32.*
