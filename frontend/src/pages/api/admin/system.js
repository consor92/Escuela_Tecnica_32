import os from 'os';
import { statfs } from 'fs/promises';

// Función para calcular uso de CPU
const getCpuUsage = () => {
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;

    cpus.forEach((cpu) => {
        for (let type in cpu.times) {
            totalTick += cpu.times[type];
        }
        totalIdle += cpu.times.idle;
    });

    return { idle: totalIdle / cpus.length, total: totalTick / cpus.length };
};

export default async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });

    try {
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        
        // Medición de CPU 1: Calcular uso inicial
        const startMeasure = getCpuUsage();

        // Pequeña pausa para medir el cambio (simulado)
        await new Promise(resolve => setTimeout(resolve, 100));

        // Medición de CPU 2: Calcular uso final
        const endMeasure = getCpuUsage();
        const idleDiff = endMeasure.idle - startMeasure.idle;
        const totalDiff = endMeasure.total - startMeasure.total;
        const cpuPercentage = 100 - Math.floor(100 * idleDiff / totalDiff);
        
        // Obtener uso de disco
        let diskUsage = "N/A";
        try {
            const stats = await statfs('/');
            const total = stats.blocks * stats.bsize;
            const free = stats.bfree * stats.bsize;
            const used = total - free;
            const percentage = ((used / total) * 100).toFixed(1);
            diskUsage = `${percentage}%`;
        } catch (e) { diskUsage = "Acceso denegado"; }

        const stats = {
            os: `${os.type()} ${os.release()}`,
            arch: os.arch(),
            cpu: os.cpus()[0].model,
            cpuUsage: cpuPercentage, // Porcentaje real de uso
            containerId: process.env.HOSTNAME || os.hostname(),
            processes: os.cpus().length,
            disk: diskUsage,
            memory: {
                used: (usedMem / 1024 / 1024 / 1024).toFixed(2),
                total: (totalMem / 1024 / 1024 / 1024).toFixed(2),
                percentage: ((usedMem / totalMem) * 100).toFixed(1)
            },
            uptime: (os.uptime() / 3600).toFixed(1) + 'h'
        };

        res.status(200).json(stats);
    } catch (error) {
        console.error('System API Error:', error);
        res.status(500).json({ error: 'No se pudieron obtener métricas' });
    }
}
