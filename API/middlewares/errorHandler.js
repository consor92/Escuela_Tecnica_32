#!/usr/bin/env node
/* eslint-disable no-undef */

const logger = require('./logger');

// Middleware de manejo de errores
module.exports = (err, req, res, next) => {
    // Imprime el error en la consola usando el logger
    logger.error(err.stack);

    // Estructura básica de la respuesta de error
    const errorResponse = {
        code: err.status || 500, // Código de estado HTTP. Por defecto es 500 (Error Interno del Servidor)
        message: err.message || 'Internal Server Error', // Mensaje del error. Mensaje por defecto si no se proporciona
    };

    // En entorno de desarrollo, añade información adicional para facilitar la depuración
    if (process.env.ENV === 'development') {
        errorResponse.stack = err.stack; // Incluye la traza de pila solo en desarrollo
    }

    // Manejo de errores específicos de Mongoose

    // Error de validación de Mongoose
    if (err.name === 'ValidationError') {
        errorResponse.code = 400; // Código de estado HTTP para errores de solicitud incorrecta
        errorResponse.errors = Object.values(err.errors).map(e => e.message); // Extrae mensajes de error de validación
    }

    // Error de clave duplicada en MongoDB
    if (err.code && err.code === 11000) {
        errorResponse.code = 400; // Código de estado HTTP para errores de solicitud incorrecta
        errorResponse.message = 'Duplicate key error: ' + JSON.stringify(err.keyValue); // Mensaje detallado del error
    }

    // Error de tipo de datos en Mongoose
    if (err.name === 'CastError') {
        errorResponse.code = 400; // Código de estado HTTP para errores de solicitud incorrecta
        errorResponse.message = `Invalid value for ${err.path}: ${err.value}`; // Mensaje que describe el error
    }

    // Manejo de errores relacionados con JWT (JSON Web Token)

    // Token JWT inválido
    if (err.name === 'JsonWebTokenError') {
        errorResponse.code = 401; // Código de estado HTTP para errores de autenticación
        errorResponse.message = 'Invalid token'; // Mensaje de error específico
    }

    // Token JWT expirado
    if (err.name === 'TokenExpiredError') {
        errorResponse.code = 401; // Código de estado HTTP para errores de autenticación
        errorResponse.message = 'Token expired'; // Mensaje de error específico
    }

    // Manejo de errores de conexión a MongoDB

    // Error de red de MongoDB
    if (err.name === 'MongoNetworkError') {
        errorResponse.code = 503; // Código de estado HTTP para servicio no disponible
        errorResponse.message = 'Database connection error'; // Mensaje de error específico
    }

    // Manejo de errores de autorización

    // Error de autorización
    if (err.name === 'UnauthorizedError') {
        errorResponse.code = 403; // Código de estado HTTP para prohibido
        errorResponse.message = 'Access denied'; // Mensaje de error específico
    }

    // Manejo de errores de recursos no encontrados

    // Recurso no encontrado
    if (err.status === 404) {
        errorResponse.code = 404; // Código de estado HTTP para recurso no encontrado
        errorResponse.message = 'Resource not found'; // Mensaje de error específico
    }

    // Manejo de métodos no permitidos

    // Método no permitido
    if (err.status === 405) {
        errorResponse.code = 405; // Código de estado HTTP para método no permitido
        errorResponse.message = 'Method not allowed'; // Mensaje de error específico
    }

    // Envía la respuesta JSON al cliente
    res.status(errorResponse.code).json(errorResponse);
};
