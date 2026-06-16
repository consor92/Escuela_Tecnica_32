'use server';

import pool from '@/lib/db';

export async function normalizeName(name: string) {
    if (!name) return [];
    return name.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Quitar tildes
        .replace(/[^a-z0-9 ]/g, " ") // Quitar puntos y signos
        .split(/\s+/)
        .filter(w => w.length > 1);
}

export async function findUserIdInTeam(fullName: string, teamMembers: any[]) {
    const jiraWords = await normalizeName(fullName);
    if (jiraWords.length === 0) return null;

    for (const member of teamMembers) {
        const sysWords = await normalizeName(`${member.first_name} ${member.last_name}`);
        
        // Coincidencia: si al menos 2 palabras del nombre de Jira existen en el sistema (o todas si son pocas)
        const matches = jiraWords.filter(jw => sysWords.some(sw => sw.includes(jw) || jw.includes(sw))).length;
        
        if (matches >= Math.min(jiraWords.length, 2)) {
            return member.id;
        }
    }
    return null;
}
