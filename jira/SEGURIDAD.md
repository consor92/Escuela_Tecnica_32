# Recomendaciones de Seguridad para Producción

---

## ✅ FIXES APLICADOS (29/06/2026)

### 🔧 Fix #1: Usuario de DB limitado (SEGURIDAD)
- Se creó el usuario `scrum_app@localhost` con contraseña segura
- Permisos limitados a solo `SELECT, INSERT, UPDATE, DELETE` en `scrum_eval.*`
- Se actualizó `.env` para usar este usuario en lugar de `root` sin contraseña
- El usuario `root` sigue existiendo para tareas administrativas

### 🔧 Fix #2: Burndown chart (BUG)
- `summary.ts:250` — se eliminó la mutación de `currentDate.setHours()` dentro del `.filter()`
- Ahora se compara con `currentDate.getTime()` sin efectos secundarios

### 🔧 Fix #3: Tablas faltantes del módulo Jira (FUNCIONALIDAD)
- Se agregaron al `init.sql` y se crearon en DB:
  - `scrum_bimestres_config` — configuración de fechas por bimestre
  - `scrum_ceremonies` — registro de ceremonias Scrum
  - `scrum_attendance` — asistencia a ceremonias
- Datos de bimestres precargados (B1-B4 con fechas 2026)

### 🔧 Fix #4: Error de compilación TypeScript
- `TeamCard.tsx:43` — `updateExternalId(userId, newId)` → `parseInt(newId, 10)`
- `summary.ts` y `jira-parser.ts` — variables `let` → `const`

### 🔧 Fix #5: Crash de MariaDB 10.4 con NOT EXISTS (BUG CRÍTICO)
- `admin/page.tsx:117-129` — se reescribió la subconsulta de `pending_count`
- El patrón `NOT EXISTS` con correlación causaba crash en MariaDB 10.4.32
- Se reemplazó por `LEFT JOIN + IS NULL` (anti-join estándar) que funciona en cualquier versión

### 🔧 Fix #6: Botón para borrar datos Jira
- Se agregó botón "Borrar Datos Jira" al lado de "Seleccionar Archivo" en el módulo Scrum-Eval
- Server action `deleteJiraData` en `actions.ts`

---

## GIT

### 10. No hay repositorio git inicializado

- El proyecto no tiene `git init` ejecutado.
- **Solución:** Antes de iniciar el repositorio, asegurarse de que `.gitignore` ignore `.env` (actualmente solo ignora `.env*.local`). Agregar esta línea al `.gitignore`:
  ```
  .env
  ```

### 11. El `.gitignore` no ignora `.env` (RIESGO ALTO)

**Archivo:** `.gitignore:29`

```
.env*.local
```

- Esto ignora archivos como `.env.local` o `.env.production.local`, pero **NO ignora `.env`**.
- Si alguien hace `git add .` y commitea, el archivo con credenciales de DB queda en el historial de git para siempre.
- **Solución:** Agregar `.env` (sin asteriscos) al `.gitignore`.

### 12. Riesgo de credenciales en historial de git

- Una vez que un archivo con credenciales se sube a git, eliminarlo después no alcanza — queda en el historial.
- **Solución:**
  - Nunca committear `.env`.
  - Usar un archivo `.env.example` como plantilla con valores genéricos que sí se suba a git.
  - Si ya se commitearon credenciales por error, usar `git filter-branch` o `BFG Repo-Cleaner` para purgar el historial.

---

## BASE DE DATOS (MySQL / XAMPP)

### 13. Usuario `root` sin contraseña (CRÍTICO)

**Archivo:** `.env:2-3`

```
DB_USER=root
DB_PASSWORD=
```

- En producción, tener MySQL con `root` y contraseña vacía es una vulnerabilidad grave. Cualquier proceso en el servidor (o un atacante con acceso limitado) puede conectarse a la DB con permisos totales.
- **Solución:**
  - Crear un usuario específico para la aplicación con permisos limitados (solo `SELECT`, `INSERT`, `UPDATE`, `DELETE` en la DB `scrum_eval`).
  - Ponerle una contraseña segura.
  - Ejemplo desde SQL:
    ```sql
    CREATE USER 'scrum_app'@'localhost' IDENTIFIED BY 'contraseña_segura';
    GRANT SELECT, INSERT, UPDATE, DELETE ON scrum_eval.* TO 'scrum_app'@'localhost';
    FLUSH PRIVILEGES;
    ```
  - Actualizar `.env` con ese usuario.

### 14. Puerto 3306 expuesto por defecto

- XAMPP expone MySQL en `localhost:3306`. Si el servidor tiene IP pública y no hay firewall, podrían intentar conexiones externas.
- **Solución:** Asegurarse de que MySQL solo escuche en `127.0.0.1` (configurar `bind-address = 127.0.0.1` en `my.ini`) o usar firewall para bloquear el puerto 3306 desde afuera.

### 15. La DB permite conexiones sin SSL

- Dependiendo de la configuración de XAMPP, las conexiones a MySQL pueden ir en texto plano.
- **Solución:** Si la app se conecta desde otro servidor, forzar SSL en MySQL y en la conexión desde Node.js.


## 1. JWT Secret hardcodeado (CRÍTICO)

**Archivo:** `src/lib/auth.ts:5`

```ts
const secretKey = "secret";
const key = new TextEncoder().encode(process.env.JWT_SECRET || secretKey);
```

- Si no existe `JWT_SECRET` en `.env`, cae a `"secret"` — cualquier persona puede falsificar tokens.
- **Solución:** Definir `JWT_SECRET` en `.env` con una clave larga y aleatoria (ej: generada con `openssl rand -base64 32`).

---

## 2. Contraseñas en MD5 (CRÍTICO)

**Archivo:** `init.sql:30`

```sql
password_md5 VARCHAR(32) NOT NULL
```

- MD5 es un hash cryptográficamente roto para contraseñas. Se puede revertir en milisegundos con tablas rainbow.
- **Solución:** Usar **bcrypt** o **Argon2**. Ejemplo con bcrypt: `await bcrypt.hash(password, 10)` para guardar y `await bcrypt.compare(password, hash)` para verificar.

---

## 3. Passwords en texto plano en logs (CRÍTICO)

**Archivo:** `src/app/login/actions.ts:16-17`

```ts
console.log('Password (plain):', password);
console.log('Password (MD5):', password_md5);
```

- Las contraseñas NUNCA deben loguearse, ni en texto plano ni hasheadas.
- **Solución:** Eliminar esos `console.log` o reemplazarlos por logs genéricos como `console.log('Intento de login para:', email)`.

---

## 4. Comparación de contraseña en texto plano como fallback (CRÍTICO)

**Archivo:** `src/app/login/actions.ts:39`

```ts
const match = (user.password_md5 === password_md5 || user.password_md5 === password);
```

- Permite iniciar sesión enviando la contraseña directamente si por algún motivo coincide con el hash almacenado. Esto es una puerta trasera.
- **Solución:** Usar solo `user.password_md5 === password_md5` (y migrar a bcrypt).

---

## 5. Cookies de sesión sin `secure` ni `sameSite`

**Archivo:** `src/lib/auth.ts:29`

```ts
cookies().set('session', session, { expires, httpOnly: true });
```

- `httpOnly: true` está bien, pero en producción debería tener también:
  - `secure: true` (solo se envía por HTTPS)
  - `sameSite: 'lax'` o `'strict'` (protege contra CSRF)
- **Solución:** Agregar `secure: true, sameSite: 'lax'`.

---

## 6. Consultas SQL con interpolación directa (RIESGO MEDIO)

**Archivo:** `src/app/(protected)/admin/page.tsx` (múltiples consultas con `${bimestralPeriodIds.join(',')}`)

- Aunque `bimestralPeriodIds` viene de la DB, la interpolación de strings en SQL es una mala práctica que puede derivar en inyección SQL si en el futuro los datos vienen de otra fuente.
- **Solución:** Usar placeholders (`?`) y pasar los valores como array al `execute()` siempre.

---

## 7. Sin límite de intentos de login (RIESGO MEDIO)

- Cualquier persona puede hacer fuerza bruta al login sin restricción.
- **Solución:** Implementar rate limiting (ej: con un contador en DB por email/IP tras 3-5 intentos fallidos, bloquear por 15 minutos).

---

## 8. Sin sanitización de entrada en login

**Archivo:** `src/app/login/actions.ts:10-11`

```ts
const email = formData.get('email') as string;
const password = formData.get('password') as string;
```

- Los datos se usan directamente sin validar formato.
- **Solución:** Validar que email tenga formato válido y que password cumpla con una longitud mínima antes de procesar.

---

## 9. La sesión expira en 2 horas sin refresh en el middleware

- El `updateSession` del middleware refresca la cookie pero no en todas las rutas protegidas (solo el matcher del middleware).
- **Solución:** Verificar que el middleware refresque correctamente la sesión en todas las rutas protegidas.
