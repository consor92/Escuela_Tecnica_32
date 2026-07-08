import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const scope = searchParams.get('scope') || 'unread';

  try {
    if (scope === 'unread') {
      const [rows]: any = await pool.execute(
        'SELECT id, titulo, mensaje, tipo, leida, fecha FROM asis_notificaciones WHERE user_id = ? AND leida = 0 ORDER BY fecha DESC',
        [session.user.id]
      );
      return NextResponse.json({ notificaciones: rows, count: rows.length });
    }

    const [rows]: any = await pool.execute(
      'SELECT id, titulo, mensaje, tipo, leida, fecha FROM asis_notificaciones WHERE user_id = ? ORDER BY fecha DESC LIMIT 20',
      [session.user.id]
    );
    return NextResponse.json({ notificaciones: rows });
  } catch (err) {
    return NextResponse.json({ error: 'Error al obtener notificaciones' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { id, markAll } = await req.json();

  try {
    if (markAll) {
      await pool.execute(
        'UPDATE asis_notificaciones SET leida = 1 WHERE user_id = ? AND leida = 0',
        [session.user.id]
      );
    } else if (id) {
      await pool.execute(
        'UPDATE asis_notificaciones SET leida = 1 WHERE id = ? AND user_id = ?',
        [id, session.user.id]
      );
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Error al actualizar notificación' }, { status: 500 });
  }
}
