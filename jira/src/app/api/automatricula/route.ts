import pool from '@/lib/db';
import { getSession } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { codigo } = await req.json();
  if (!codigo) return NextResponse.json({ error: 'Código requerido' }, { status: 400 });

  const [cursos]: any = await pool.execute(
    'SELECT id, nombre, ciclo_lectivo FROM asis_cursos WHERE codigo_automatricula = ? AND activo = 1',
    [codigo]
  );
  if (cursos.length === 0) return NextResponse.json({ error: 'Código inválido' }, { status: 400 });

  const curso = cursos[0];
  const userId = session.user.id;

  const [existe]: any = await pool.execute(
    'SELECT id FROM asis_alumnos_curso WHERE user_id = ? AND curso_id = ?',
    [userId, curso.id]
  );
  if (existe.length > 0) return NextResponse.json({ error: 'Ya estás matriculado en este curso' }, { status: 400 });

  await pool.execute(
    'INSERT INTO asis_alumnos_curso (user_id, curso_id, activo) VALUES (?, ?, 1)',
    [userId, curso.id]
  );

  return NextResponse.json({ success: true, curso: curso.nombre + ' (' + curso.ciclo_lectivo + ')' });
}
