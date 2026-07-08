'use server';

import pool from '@/lib/db';

export async function getTeams() {
  const [teams]: any = await pool.execute("SELECT * FROM teams ORDER BY name ASC");
  
  const teamsWithHierarchy = await Promise.all(teams.map(async (team: any) => {
    const [members]: any = await pool.execute(
      "SELECT id, first_name, last_name, year_div, school_year, external_id FROM users WHERE team_id = ?",
      [team.id]
    );
    return {
      ...team,
      year: members[0]?.school_year || 'Sin Ciclo',
      div: members[0]?.year_div || 'Sin División',
      members: members // Incluir miembros para depuración y vinculación
    };
  }));

  // Agrupar por año y división
  return teamsWithHierarchy.reduce((acc: any, team: any) => {
    const key = `${team.year}|${team.div}`;
    if (!acc[key]) acc[key] = { year: team.year, div: team.div, teams: [] };
    acc[key].teams.push(team);
    return acc;
  }, {});
}
