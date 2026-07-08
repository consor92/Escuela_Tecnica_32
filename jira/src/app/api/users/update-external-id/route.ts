import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { userId, externalId } = await req.json();
    await pool.execute('UPDATE users SET external_id = ? WHERE id = ?', [externalId, userId]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error updating user' }, { status: 500 });
  }
}
