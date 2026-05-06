# 🐳 Escuela Técnica 32 – README de Producción

## 📌 Descripción

Este proyecto utiliza Docker Compose para desplegar una aplicación basada en:

* Frontend (Next.js)
* Nginx como proxy reverso
* Volúmenes persistentes para almacenamiento de datos

Está preparado para ejecutarse en un entorno de producción manteniendo la persistencia de datos entre despliegues.

---

## 📂 Estructura del proyecto

```
.
├── docker-compose.yml
├── frontend/
├── nginx/
├── API/ (opcional)
├── php/ (opcional)
```

---

## 💾 Persistencia de datos

Los datos se almacenan en volúmenes Docker definidos en `docker-compose.yml`:

```yaml
volumes:
  uploads:
  docs:
  data:
```

### 📦 Descripción

* `uploads` → Archivos subidos por usuarios
* `docs` → Documentación pública (PDF, etc.)
* `data` → Datos internos (JSON, configuraciones)

⚠️ **Estos volúmenes NO se eliminan al detener contenedores.**

---

## 🚀 Deploy inicial

### 1. Clonar repositorio

```bash
git clone https://github.com/consor92/Escuela_Tecnica_32.git
cd Escuela_Tecnica_32
```

### 2. Levantar servicios

```bash
docker-compose up -d --build
```

### 3. Verificar

```bash
docker ps
docker-compose logs -f
```

---

## 🔄 Actualización (deploy seguro)

```bash
git pull
docker-compose down
docker-compose up -d --build
```

✔ Mantiene los datos en volúmenes
✔ Reconstruye servicios con cambios nuevos

---

## 🧹 Mantenimiento (SIN borrar datos)

### Detener servicios

```bash
docker-compose down
```

### Limpiar contenedores sueltos

```bash
docker rm -f $(docker ps -aq)
```

### Limpiar imágenes

```bash
docker image prune -a
```

---

## ⚠️ Limpieza completa (PELIGRO)

```bash
docker-compose down -v
```

o

```bash
docker system prune -a --volumes
```

❌ Esto elimina:

* Contenedores
* Imágenes
* **Volúmenes (datos irreversibles)**

---

## 💾 Backup de volúmenes

### Backup (ejemplo: uploads)

```bash
docker run --rm -v uploads:/volume -v $(pwd):/backup alpine \
tar czf /backup/uploads_backup.tar.gz -C /volume .
```

### Restaurar

```bash
docker run --rm -v uploads:/volume -v $(pwd):/backup alpine \
sh -c "cd /volume && tar xzf /backup/uploads_backup.tar.gz"
```

---

## 🔐 Variables de entorno

Si aplica:

```bash
cp .env.example .env
nano .env
```

Ejemplo:

```
NODE_ENV=production
PORT=3000
```

---

## 🌐 Nginx

El contenedor Nginx actúa como proxy:

* Puerto: 80
* Configuración: `nginx/default.conf`

---

## 📊 Monitoreo

```bash
docker stats
```

Logs:

```bash
docker-compose logs -f
docker-compose logs -f frontend
docker-compose logs -f nginx
```

---

## 🧠 Buenas prácticas

* No usar `-v` en producción
* Hacer backups antes de actualizar
* Verificar cambios con `git fetch`
* Mantener consistencia en nombres de volúmenes
* Usar `restart: unless-stopped`

---

## 🚨 Troubleshooting

### ❌ Error: volumen no definido

Verificar en `docker-compose.yml`:

```yaml
volumes:
  uploads:
  docs:
  data:
```

---

### ❌ Cambios no reflejados

```bash
docker-compose up -d --build
```

---

### ❌ Contenedor no inicia

```bash
docker-compose logs -f
```

---

### ❌ Problemas de permisos

```bash
chmod -R 777 frontend/public
```

---

## 🔁 Pipeline recomendado

```bash
git pull
docker-compose down
docker-compose up -d --build
docker image prune -f
```

---

## 📌 Mejoras futuras (opcional)

* HTTPS con Let's Encrypt
* CI/CD (GitHub Actions)
* Separación dev / prod (`docker-compose.prod.yml`)
* Monitoreo avanzado

---

## 👨‍💻 Notas finales

* Los volúmenes garantizan persistencia de datos
* La infraestructura está pensada para reinicios seguros
* Evitar comandos destructivos sin backup previo

---

Aquí tienes el bloque completo y detallado, listo para copiar y pegar en tu `README.md`. Está redactado para que cualquier desarrollador (o tú mismo en el futuro) entienda exactamente por qué se hicieron estos cambios y cómo funciona la arquitectura de archivos estáticos entre Docker, Linux y Apache.

```markdown
## 🛠️ Arquitectura de Archivos Estáticos: Docker, Apache y Permisos

En este proyecto, los archivos subidos por los usuarios (imágenes, documentos) se guardan en el servidor físico utilizando volúmenes de Docker (`bind-mounts`). 

Para evitar el problema común de Next.js donde **los archivos nuevos devuelven un Error 404 hasta reiniciar el contenedor**, se configuró a **Apache para que sirva los archivos estáticos directamente desde el disco**, saltándose el proxy de Node.js.

A continuación, se detalla la configuración necesaria de este flujo en sus tres niveles: Servidor web (Apache), Sistema Operativo (Linux) y Código (Next.js).

---

### 1. Configuración de Apache (Servidor Web)
Apache actúa como la puerta de entrada. En lugar de enviar las peticiones de las carpetas `/uploads` e `/images` hacia el contenedor de Docker (Next.js), las intercepta y busca los archivos físicamente en el disco. Esto garantiza que cualquier archivo nuevo sea visible **al instante**.

**Archivo de configuración:** `/etc/apache2/sites-enabled/000-default-le-ssl.conf` (o el correspondiente a tu VirtualHost)

```apache
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
```
*(Recuerda ejecutar `sudo systemctl restart apache2` tras cualquier cambio).*

---

### 2. Configuración de Permisos en Linux
Apache se ejecuta bajo un usuario especial llamado `www-data`. Para que Apache pueda leer los archivos ubicados dentro de la carpeta personal de un usuario (ej. `/home/administrador`), necesita tener permisos de "travesía" para llegar a la ruta, y pertenencia de grupo en las carpetas finales.

Ejecutar estos comandos por única vez en el servidor:

```bash
# 1. Permiso de ejecución (+x): Permite a Apache "cruzar" las carpetas, sin exponer archivos privados.
sudo chmod +x /home/administrador
sudo chmod +x /home/administrador/Escuela_Tecnica_32
sudo chmod +x /home/administrador/Escuela_Tecnica_32/frontend

# 2. Pertenencia de grupo: Hacemos que Apache (www-data) sea co-propietario de la carpeta public.
sudo chown -R administrador:www-data /home/administrador/Escuela_Tecnica_32/frontend/public
sudo chown -R administrador:www-data /home/administrador/Escuela_Tecnica_32/frontend/data

# 3. Permisos de lectura/escritura (775): El dueño y el grupo pueden leer/escribir; los demás solo leer.
sudo chmod -R 775 /home/administrador/Escuela_Tecnica_32/frontend/public
sudo chmod -R 775 /home/administrador/Escuela_Tecnica_32/frontend/data
```

---

### 3. Configuración en el Código (Imágenes Nuevas)
Cuando un usuario sube una imagen a través de la web, Next.js (Node.js) es quien la escribe en el disco. Por defecto, Node suele crear archivos con permisos restrictivos (ej. solo el dueño puede leerlos). Si esto pasa, Apache no podrá mostrarlos y lanzará un **Error 403 (Acceso Denegado) o 404**.

Para solucionarlo, forzamos a que el archivo nuevo nazca con el permiso **664**.
* **¿Qué es 664?** Significa que el dueño (Node) y el grupo (`www-data` de Apache) pueden **leer y sobreescribir** el archivo, y cualquier otra persona solo puede leer. Es el permiso ideal para seguridad web.

**Ejemplo de implementación en el endpoint de subida (`pages/api/upload.js`):**

```javascript
import fs from 'fs';
import path from 'path';

// ... lógica de recepción del archivo (multer, formidable, etc.) ...

const filePath = path.join(process.cwd(), 'public/uploads', fileName);

// 1. Guardar el archivo en el disco
fs.writeFileSync(filePath, fileBuffer);

// 2. IMPORTANTE: Asignar permiso 664 inmediatamente para que Apache lo pueda servir
try {
    fs.chmodSync(filePath, 0o664); 
} catch (error) {
    console.error("Error al asignar permisos a la nueva imagen:", error);
}
```
```

## Actualización completa del proyecto

Este procedimiento permite:

- Detener la aplicación
- Eliminar contenedores e imágenes antiguas
- Sincronizar el código local con la última versión del repositorio
- Reconstruir y levantar nuevamente los servicios

> **Importante:**  
> Este proceso elimina todos los cambios locales no guardados.  
> Los volúmenes de Docker (bases de datos, archivos persistentes, etc.) **no se eliminan**.

---

### 1. Detener los servicios

```bash
docker compose down

Detiene y elimina los contenedores definidos en docker-compose.yml.

2. Limpiar recursos de Docker
docker system prune -a -f

Elimina:

Contenedores detenidos
Imágenes no utilizadas
Redes no utilizadas
Caché de compilación

No elimina volúmenes.

3. Descargar cambios del repositorio remoto
git fetch --all

Obtiene la información más reciente de todas las ramas remotas.

4. Restaurar el proyecto exactamente como está en la rama principal
git reset --hard origin/main

Descarta todos los cambios locales y deja el código idéntico a la rama remota main.

5. Eliminar archivos locales no versionados
git clean -fd

Elimina archivos y carpetas que no están registrados en Git.

6. Reconstruir y levantar el proyecto
docker compose up -d --build

Reconstruye las imágenes necesarias e inicia todos los servicios en segundo plano.

Proceso rápido
docker compose down
docker system prune -a -f
git fetch --all
git reset --hard origin/main
git clean -fd
docker compose up -d --build

Eso queda claro y evita que alguien lo ejecute sin saber que `reset --hard` le va a borrar cambios locales.