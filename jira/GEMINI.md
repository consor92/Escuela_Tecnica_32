# Directivas del Proyecto - Encuenta + Jira

## Estándares Técnicos
- **MySQL:** No utilizar `IF NOT EXISTS` en ninguna consulta (DDL o DML), ya que causa errores en el entorno local.
- **Modelado de Datos:** Mantener una separación estricta entre los periodos académicos bi-semanales (`evaluation_periods`) y los bimestres de evaluación Scrum (`scrum_bimestres_config`).
- **Análisis de Tareas:** Diferenciar explícitamente entre tareas principales y subtareas basándose en la presencia de `parent_key` en la tabla `jira_issues`.

## Comunicación y Estilo
- **Idioma:** Hablar siempre en español.
- **Tono:** Directo, con explicaciones técnicas mínimas.
- **Planificación:** Siempre proponer un plan de trabajo detallado y obtener aprobación explícita antes de modificar cualquier archivo o estructura de datos.

## Control de Cambios
- **Permisos:** No editar ni modificar ningún archivo sin una instrucción explícita del usuario.
- **Validación:** Confirmar cada paso del plan antes de la ejecución.

## Entorno y Herramientas
- **Entorno Actual:** Ejecución local con Node.js (temporalmente para depuración).
- **Docker:** El producto está dockerizado, pero se usa localmente por ahora.
- **Rutas Locales (XAMPP):**
  - MySQL: `C:\xampp\mysql\bin\mysql.exe`
  - PHP: `C:\xampp\php\php.exe`
