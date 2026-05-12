'use server';

import pool from '@/lib/db';
import md5 from 'md5';

export async function importUsersCSV(records: any[]) {
    console.log(`[IMPORT] Iniciando procesamiento de ${records?.length} registros.`);
    const results: any[] = [];
    
    if (!records || !Array.isArray(records)) {
        return [{ email: 'N/A', status: 'error', message: 'Formato de datos inválido' }];
    }

    for (const record of records) {
        let email, nombre, apellido, curso, rol, password, usuario, id;

        // Caso 0: El registro llegó como un STRING sin procesar (tu caso actual)
        if (typeof record === 'string') {
            // Intentar detectar si usa ; o ,
            const delimiter = record.includes(';') ? ';' : ',';
            const parts = record.split(delimiter).map(p => p.replace(/^"|"$/g, '').replace(/\\"/g, '"').trim());
            
            id = parts[0];
            usuario = parts[1];
            password = parts[2];
            email = parts[3];
            nombre = parts[6];
            apellido = parts[7];
            curso = parts[8];
            rol = parts[11];
        }
        // Caso 1: Es un Array (Parsing sin headers)
        else if (Array.isArray(record)) {
            id = record[0];
            usuario = record[1];
            password = record[2];
            email = record[3];
            nombre = record[6];
            apellido = record[7];
            curso = record[8];
            rol = record[11];
        } 
        // Caso 2: Es un Objeto (Parsing con headers o claves numéricas)
        else {
            // Intentar con nombres estándar
            email = record.email || record.Email;
            nombre = record.nombre || record.Nombre;
            apellido = record.apellido || record.Apellido;
            curso = record.curso || record.Curso;
            rol = record.rol || record.Rol;
            password = record.password || record.Password;
            usuario = record.usuario || record.Usuario;
            id = record.id || record.Id;

            // Si fallan los nombres, intentar por posición (claves '0', '1', '2'...)
            if (!email || !nombre) {
                const vals = Object.values(record);
                id = record['0'] || vals[0];
                usuario = record['1'] || vals[1];
                password = record['2'] || vals[2];
                email = record['3'] || vals[3];
                nombre = record['6'] || vals[6];
                apellido = record['7'] || vals[7];
                curso = record['8'] || vals[8];
                rol = record['11'] || vals[11];
            }
        }

        // Limpieza de datos (quitar espacios, etc)
        const cleanEmail = typeof email === 'string' ? email.trim() : null;
        const cleanNombre = typeof nombre === 'string' ? nombre.trim() : null;

        if (!cleanEmail || !cleanNombre || !cleanEmail.includes('@')) {
            // No agregamos nada a results aquí para no saturar la tabla, pero logueamos en el servidor
            console.log(`[IMPORT] Fila omitida: Email=[${email}] Nombre=[${nombre}]`);
            continue;
        }

        const roleId = (rol == '1' || rol == 'Docente') ? 1 : 2;
        const password_md5 = password || md5('123');
        const username = usuario || cleanEmail.split('@')[0];
        
        let yearDiv = '6°1';
        if (curso === '27') yearDiv = '6°2';

        try {
            const [existing]: any = await pool.execute("SELECT id FROM users WHERE email = ?", [cleanEmail]);
            
            if (existing.length > 0) {
                await pool.execute("UPDATE users SET password_md5 = ? WHERE email = ?", [password_md5, cleanEmail]);
                results.push({ email: cleanEmail, nombre: `${cleanNombre} ${apellido || ''}`, status: 'skip', message: 'Pass actualizada' });
            } else {
                await pool.execute(
                    `INSERT INTO users (external_id, username, email, password_md5, role_id, first_name, last_name, school_year, year_div) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [id || null, username, cleanEmail, password_md5, roleId, cleanNombre, apellido || '', '2026', yearDiv]
                );
                results.push({ email: cleanEmail, nombre: `${cleanNombre} ${apellido || ''}`, status: 'success', message: 'Agregado' });
            }
        } catch (err: any) {
            console.error(`[IMPORT] Error en registro ${cleanEmail}:`, err.message);
            results.push({ email: cleanEmail, status: 'error', message: err.message });
        }
    }

    console.log(`[IMPORT] Finalizado. Procesados: ${results.length} de ${records.length}`);
    if (results.length === 0) {
        return [{ email: 'N/A', status: 'error', message: 'No se pudo procesar ninguna fila. Verifique que las columnas coincidan con el formato estándar.' }];
    }

    return results;
}

export async function exportEvaluationsCSV() {
    const [rows]: any = await pool.execute(`
        SELECT 
            u.school_year as Ciclo,
            u.year_div as Division,
            t.name as Equipo,
            u.last_name as Apellido,
            u.first_name as Nombre,
            u.email as Email_Alumno,
            -- Promedios de Coevaluación
            AVG(e.score_teamwork) as Prom_Trabajo_Equipo,
            AVG(e.score_development) as Prom_Desarrollo,
            AVG(e.score_class_work) as Prom_Clase,
            -- Cálculo General (Escala 1-10)
            ((AVG(e.score_teamwork) + AVG(e.score_development) + AVG(e.score_class_work)) / 3 / 4 * 10) as Nota_General_Coeval,
            -- Promedio SM (si aplica)
            (SELECT (AVG(score_sm_leadership + score_sm_facilitation + score_sm_support) / 3 / 4 * 10) 
             FROM evaluations 
             WHERE evaluatee_id = u.id AND is_sm_eval = 1) as Nota_Scrum_Master,
            -- Nota Docente (Periodo Actual)
            (SELECT score FROM teacher_evaluations te 
             JOIN evaluation_periods ep ON te.period_id = ep.id 
             WHERE te.user_id = u.id AND ep.is_active = 1 LIMIT 1) as Nota_Docente,
            -- Conteo de evaluaciones
            COUNT(e.id) as Cantidad_Evaluaciones_Recibidas
        FROM users u
        LEFT JOIN teams t ON u.team_id = t.id
        LEFT JOIN evaluations e ON u.id = e.evaluatee_id
        WHERE u.role_id = 2 AND u.first_name IS NOT NULL AND u.first_name != ''
        GROUP BY u.id
        ORDER BY u.school_year DESC, u.year_div ASC, t.name ASC, u.last_name ASC
    `);

    // Formatear números para el CSV
    return rows.map((r: any) => ({
        ...r,
        Prom_Trabajo_Equipo: r.Prom_Trabajo_Equipo ? parseFloat(r.Prom_Trabajo_Equipo).toFixed(2) : '0.00',
        Prom_Desarrollo: r.Prom_Desarrollo ? parseFloat(r.Prom_Desarrollo).toFixed(2) : '0.00',
        Prom_Clase: r.Prom_Clase ? parseFloat(r.Prom_Clase).toFixed(2) : '0.00',
        Nota_General_Coeval: r.Nota_General_Coeval ? parseFloat(r.Nota_General_Coeval).toFixed(2) : '0.00',
        Nota_Scrum_Master: r.Nota_Scrum_Master ? parseFloat(r.Nota_Scrum_Master).toFixed(2) : '-',
        Nota_Docente: r.Nota_Docente ? parseFloat(r.Nota_Docente).toFixed(2) : '-',
    }));
}
