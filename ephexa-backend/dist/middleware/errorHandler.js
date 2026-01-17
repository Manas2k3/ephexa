"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = void 0;
exports.errorHandler = errorHandler;
exports.notFound = notFound;
function errorHandler(err, req, res, next) {
    const statusCode = err.statusCode || 500;
    const message = err.isOperational ? err.message : 'Internal server error';
    // Log error in development
    if (process.env.NODE_ENV === 'development') {
        console.error('Error:', {
            message: err.message,
            stack: err.stack,
            statusCode,
        });
    }
    else {
        // Log minimal info in production
        console.error('Error:', err.message);
    }
    res.status(statusCode).json({
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
}
class ApiError extends Error {
    statusCode;
    isOperational;
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.ApiError = ApiError;
function notFound(req, res) {
    res.status(404).json({ error: 'Not found' });
}
//# sourceMappingURL=errorHandler.js.map