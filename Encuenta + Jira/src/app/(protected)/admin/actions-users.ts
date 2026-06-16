'use server';
import pool from '@/lib/db';

export async function updateExternalId(userId: number, externalId: number) {
    await pool.execute('UPDATE users SET external_id = ? WHERE id = ?', [externalId, userId]);
    return { success: true };
}
