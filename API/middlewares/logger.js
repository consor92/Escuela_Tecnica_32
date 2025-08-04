const winston = require('winston');
const path = require('path');

// Configuración de Winston
const logger = winston.createLogger({
    level: 'info', // Nivel de log por defecto
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level}]: ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console(), // Imprime los logs en la consola
    ],
});

// Exporta el logger
module.exports = logger;
