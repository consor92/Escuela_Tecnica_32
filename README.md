# 📊 Sistema de Calificaciones & Infraestructura de Producción - Escuela Técnica 32

¡Bienvenido al ecosistema de la **Escuela Técnica 32**! Este repositorio combina una plataforma moderna de coevaluación bajo metodología Scrum con una infraestructura de despliegue robusta basada en contenedores Docker y proxy inverso con Apache/Nginx.

---

## 🚀 Resumen del Proyecto
Este sistema permite a los alumnos calificarse entre sí basándose en criterios de trabajo en equipo, desarrollo y desempeño en clase, mientras que proporciona a los docentes herramientas de visualización avanzada para detectar tendencias, anomalías y dinámicas grupales en tiempo real.

---

## ✨ Funcionalidades Principales

### 👤 Portal del Alumno
* **Perfil Obligatorio:** Al ingresar por primera vez, los alumnos deben completar su Ciclo Lectivo y Año/División. No se permite el acceso al panel hasta que estos datos estén actualizados.
* **Evaluación con Emojis:** Sistema de calificación intuitivo mediante caritas (😡, 😕, 🙂, 😄) que reemplazan los números del 1 al 4 para una mejor experiencia de usuario.
* **Evaluación Selectiva de Scrum Master:** El sistema reconoce automáticamente quién fue el Scrum Master oficial del equipo para el bimestre actual y solo habilita la sección de "Gestión Scrum" para ese alumno específico.
* **Comentarios Limitados:** Los alumnos pueden dejar feedback cualitativo con un límite de 100 caracteres y un contador en tiempo real.

### 👨‍🏫 Panel Docente (Admin)
* **Gestión de Equipos:** Creación, edición y eliminación de equipos. Asignación rápida de alumnos mediante un buscador inteligente que muestra datos escolares.
* **Asignación de Scrum Masters:** Herramienta para designar un Scrum Master oficial por equipo para cada uno de los 4 bimestres del año.
* **Evaluación Docente:** El profesor puede poner sus propias notas (1-10) y comentarios privados por alumno y periodo.
* **Reporte General:** Tabla dinámica ordenable y filtrable con todos los promedios: Trabajo en Equipo, Desarrollo, Clase, Scrum Master y Nota del Profesor.

### 📈 Análisis Visual Avanzado (Gráficas)
* **Cronograma Anual:** Gráficas de evolución que cubren todo el calendario escolar (Marzo a Noviembre).
* **Focus Mode:** Al hacer clic en un alumno en la leyenda, se resaltan sus datos y se atenúan los demás para un análisis individual profundo.
* **Zonas de Calor:** Fondo del gráfico coloreado suavemente para identificar zonas de Excelencia (8-10), Aprobado (6-8) y Riesgo (0-4).
* **Detección de Anomalías:** Alerta visual automática con una **X roja** cuando un alumno baja más de 3 puntos de un periodo a otro.
* **Análisis de Tendencia:** Iconos dinámicos (📈/📉/➡️) que calculan la trayectoria reciente de cada estudiante.
* **Rich Tooltips:** Al pasar el mouse por cualquier punto, se muestran todos los comentarios (de alumnos y profesor) asociados a esa nota.

---

## 🛠️ Mejoras Técnicas Recientes
* **Estética Moderna:** Rediseño total de la interfaz con bordes redondeados, sombras suaves, animaciones de entrada y soporte completo para **Modo Oscuro**.
* **Consistencia de Tema:** Scripts optimizados para evitar el parpadeo de blanco al cargar la página en modo oscuro.
* **Base de Datos Robusta:** Implementación de tablas para `scrum_masters` y `teacher_evaluations` con integridad referencial.
* **Importación Inteligente:** Script de carga masiva de usuarios desde CSV con sanitización de datos y asignación automática de roles.

---

## 💻 Tecnologías Utilizadas
* **Backend:** PHP 8.2 (Apache)
* **Base de Datos:** MariaDB 10.6
* **Frontend:** Next.js / Vanilla JS, CSS3 Moderno, HTML5
* **Infraestructura:** Docker, Docker Compose, Apache (Proxy/Static Server)
* **Librerías:** [Chart.js](https://www.chartjs.org/) (Gráficas) y [Choices.js](https://joshuajohnson.co.uk/Choices/) (Selectores).

---

## 🐳 Guía de Producción (Docker)

### 📌 Descripción
Este entorno utiliza Docker Compose para desplegar los servicios manteniendo la persistencia de datos entre despliegues.

### 📂 Estructura del proyecto
```text
.
├── docker-compose.yml
├── frontend/
├── nginx/
├── API/ (opcional)
├── php/ (opcional)
💾 Persistencia de datos
Los datos se almacenan en volúmenes Docker definidos en docker-compose.yml:

uploads → Archivos subidos por usuarios.

docs → Documentación pública (PDF, etc.).

data → Datos internos (JSON, configuraciones).

⚠️ Importante: Estos volúmenes NO se eliminan al detener los contenedores.

🚀 Despliegue Inicial
Clonar repositorio:

Bash
git clone [https://github.com/consor92/Escuela_Tecnica_32.git](https://github.com/consor92/Escuela_Tecnica_32.git)
cd Escuela_Tecnica_32
Levantar servicios:

Bash
docker compose up -d --build
Verificar estado:

Bash
docker ps
docker compose logs -f
🔄 Actualización Completa del Proyecto (Hard Reset)
Este procedimiento permite detener la aplicación, limpiar imágenes antiguas, sincronizar el código local con la rama principal descartando cambios no guardados, y reconstruir los servicios.

⚠️ Importante: Este proceso elimina todos los cambios locales no guardados. Los volúmenes de Docker (bases de datos, archivos persistentes, etc.) no se eliminan.

Paso a paso:
Detener los servicios: (Detiene y elimina contenedores)

Bash
docker compose down
Limpiar recursos de Docker: (Elimina contenedores detenidos, imágenes y redes no usadas)

Bash
docker system prune -a -f
Descargar cambios del repositorio remoto:

Bash
git fetch --all
Restaurar el proyecto a la rama principal: (Descarta cambios locales)

Bash
git reset --hard origin/main
Eliminar archivos locales no versionados:

Bash
git clean -fd
Reconstruir y levantar el proyecto:

Bash
docker compose up -d --build
⚡ Proceso rápido (Copiar y pegar):
Bash
docker compose down
docker system prune -a -f
git fetch --all
git reset --hard origin/main
git clean -fd
docker compose up -d --build
🛠️ Arquitectura de Archivos Estáticos: Docker, Apache y Permisos
En este proyecto, los archivos subidos por los usuarios (imágenes, documentos) se guardan en el servidor físico utilizando volúmenes de Docker (bind-mounts).

Para evitar el problema común de Next.js donde los archivos nuevos devuelven un Error 404 hasta reiniciar el contenedor, se configuró a Apache para que sirva los archivos estáticos directamente desde el disco, saltándose el proxy de Node.js.

1. Configuración de Apache (Servidor Web)
Apache actúa como la puerta de entrada. En lugar de enviar las peticiones de las carpetas /uploads e /images hacia el contenedor de Docker (Next.js), las intercepta y busca los archivos físicamente en el disco.

Archivo de configuración: /etc/apache2/sites-enabled/000-default-le-ssl.conf (o el correspondiente a tu VirtualHost)

Apache
# 1. Rutas Físicas (Alias): Indicamos a Apache dónde buscar los archivos estáticos
Alias /uploads /home/administrador/Escuela_Tecnica_32/frontend/public/uploads
Alias /images /home/administrador/Escuela_Tecnica_32/frontend/public/images

# 2. Permisos de Directorio: Autorizamos a Apache a servir contenido de esta ruta
<Directory /home/administrador/Escuela_Tecnica_32/frontend/public/>
    Options Indexes FollowSymLinks
    AllowOverride None
    Require all granted
</Directory>

# 3. Excepciones del Proxy: Evitamos que Apache le pase estas peticiones a Docker
ProxyPass /uploads !
ProxyPass /images !

# 4. Proxy Principal: El resto del tráfico web va al contenedor Next.js
ProxyPass / [http://127.0.0.1:3000/](http://127.0.0.1:3000/)
ProxyPassReverse / [http://127.0.0.1:3000/](http://127.0.0.1:3000/)
(Recuerda ejecutar sudo systemctl restart apache2 tras cualquier cambio).

2. Configuración de Permisos en Linux
Apache se ejecuta bajo un usuario especial llamado www-data. Para que Apache pueda leer los archivos ubicados dentro de la carpeta personal (ej. /home/administrador), necesita tener permisos de "travesía" y pertenencia de grupo. Ejecutar por única vez:

Bash
# 1. Permiso de ejecución (+x): Permite a Apache "cruzar" las carpetas
sudo chmod +x /home/administrador
sudo chmod +x /home/administrador/Escuela_Tecnica_32
sudo chmod +x /home/administrador/Escuela_Tecnica_32/frontend

# 2. Pertenencia de grupo: Apache (www-data) es co-propietario
sudo chown -R administrador:www-data /home/administrador/Escuela_Tecnica_32/frontend/public
sudo chown -R administrador:www-data /home/administrador/Escuela_Tecnica_32/frontend/data

# 3. Permisos de lectura/escritura (775)
sudo chmod -R 775 /home/administrador/Escuela_Tecnica_32/frontend/public
sudo chmod -R 775 /home/administrador/Escuela_Tecnica_32/frontend/data
3. Configuración en el Código (Imágenes Nuevas)
Para que Node.js no cree archivos con permisos restrictivos que bloqueen a Apache (causando Error 403/404), forzamos a que el archivo nuevo nazca con el permiso 664 (dueño y grupo leen/escriben, resto solo lee).

Ejemplo en pages/api/upload.js:

JavaScript
import fs from 'fs';
import path from 'path';

// ... lógica de recepción del archivo ...
const filePath = path.join(process.cwd(), 'public/uploads', fileName);

// 1. Guardar el archivo en el disco
fs.writeFileSync(filePath, fileBuffer);

// 2. IMPORTANTE: Asignar permiso 664 inmediatamente
try {
    fs.chmodSync(filePath, 0o664); 
} catch (error) {
    console.error("Error al asignar permisos a la nueva imagen:", error);
}
🧹 Mantenimiento y Backups
Limpieza Básica (Sin borrar datos)
Bash
# Detener servicios
docker compose down
# Limpiar contenedores sueltos
docker rm -f $(docker ps -aq)
# Limpiar imágenes
docker image prune -a
⚠️ Limpieza Completa (Peligro: Borra Volúmenes)
Bash
docker compose down -v
# O bien
docker system prune -a --volumes
📦 Backups de Volúmenes
Crear Backup (ej. uploads):

Bash
docker run --rm -v uploads:/volume -v $(pwd):/backup alpine \
tar czf /backup/uploads_backup.tar.gz -C /volume .
Restaurar Backup:

Bash
docker run --rm -v uploads:/volume -v $(pwd):/backup alpine \
sh -c "cd /volume && tar xzf /backup/uploads_backup.tar.gz"
🚨 Troubleshooting & Notas Finales
Cambios no reflejados: Verifique haber ejecutado el proceso de actualización completo (git reset + docker build).

Error de volumen no definido: Revise la indentación en la sección volumes de su docker-compose.yml.

Contenedor no inicia: Inspeccione los errores en vivo con docker compose logs -f.

Monitoreo: Use docker stats para ver el consumo de recursos en tiempo real.

Buenas Prácticas: No use la bandera -v (volumen efímero) en producción, mantenga consistencia en los nombres de los volúmenes, y evite comandos destructivos sin backup previo.

v1.0.5 - Sistema de Coevaluación Bisemanal | Escuela Técnica 32