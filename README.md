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