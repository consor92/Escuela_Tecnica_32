'use server';

import pool from '@/lib/db';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function createReassignment(data: {
  teamId: number;
  sprintNumber: number;
  originalTaskKey: string;
  newTaskKey: string;
  fromUserId: number;
  toUserId: number;
  reason: string;
  assignedAt?: string;
  reassignedAt?: string;
}) {
  const session = await getSession();
  if (!session) throw new Error('No autorizado');

  const { teamId, sprintNumber, originalTaskKey, newTaskKey, fromUserId, toUserId, reason, assignedAt, reassignedAt } = data;

  await pool.execute(
    `INSERT INTO task_reassignments (team_id, sprint_number, original_task_key, new_task_key, from_user_id, to_user_id, requested_by, reason, assigned_at, reassigned_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [teamId, sprintNumber, originalTaskKey, newTaskKey, fromUserId, toUserId, session.user.id, reason, assignedAt || null, reassignedAt || null]
  );

  revalidatePath('/dashboard');
  return { success: true };
}

export async function getTeamMembers(teamId: number) {
  const [members]: any = await pool.execute(
    'SELECT id, first_name, last_name, username FROM users WHERE team_id = ? AND first_name IS NOT NULL AND first_name != "" ORDER BY first_name',
    [teamId]
  );
  return members;
}

export async function getTeamIssues(teamId: number) {
  const [rows]: any = await pool.execute(
    "SELECT issue_key, parent_key, summary, assignee_id, sprint FROM jira_issues WHERE cell_id = ? AND (status IS NULL OR status NOT LIKE '%Finaliz%') ORDER BY issue_key",
    [teamId]
  );
  return rows;
}

export async function getTeamReassignments(teamId: number) {
  const [rows]: any = await pool.execute(
    `SELECT tr.*, u1.first_name as from_name, u1.last_name as from_last, u2.first_name as to_name, u2.last_name as to_last, r.first_name as req_name, r.last_name as req_last
     FROM task_reassignments tr
     JOIN users u1 ON u1.id = tr.from_user_id
     JOIN users u2 ON u2.id = tr.to_user_id
     JOIN users r ON r.id = tr.requested_by
     WHERE tr.team_id = ?
     ORDER BY tr.created_at DESC`,
    [teamId]
  );
  return rows;
}

export async function validateSubtask(parentKey: string, childKey: string) {
  const [rows]: any = await pool.execute(
    'SELECT issue_key, parent_key FROM jira_issues WHERE issue_key = ? AND parent_key = ?',
    [childKey, parentKey]
  );
  return rows.length > 0;
}
