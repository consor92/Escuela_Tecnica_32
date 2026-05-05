import fs from 'fs';
import path from 'path';

export function readData(filename) {
    const filePath = path.resolve(process.cwd(), 'data', filename);
    const fileData = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileData);
}

export function writeData(filename, data) {
    const filePath = path.resolve(process.cwd(), 'data', filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export function addLog(user, action, type = 'info') {
    const filePath = path.resolve(process.cwd(), 'data', 'logs.json');
    let logs = [];
    try {
        const fileData = fs.readFileSync(filePath, 'utf8');
        logs = JSON.parse(fileData);
    } catch (e) {
        logs = [];
    }
    
    // Obtener el ID más alto actual y sumar 1, o empezar en 1
    const nextId = logs.length > 0 ? Math.max(...logs.map(l => l.id || 0)) + 1 : 1;
    
    const newLog = {
        id: nextId,
        user: user && user !== 'undefined' ? user : 'Admin',
        action,
        type, // 'news', 'doc', 'system', 'media'
        date: new Date().toISOString()
    };
    
    logs.unshift(newLog);
    // Mantener los últimos 200 logs
    if (logs.length > 200) logs.pop();
    
    fs.writeFileSync(filePath, JSON.stringify(logs, null, 2));
}
