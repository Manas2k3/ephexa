"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const database_1 = require("./config/database");
const errorHandler_1 = require("./middleware/errorHandler");
const socket_1 = require("./socket");
// Routes
const auth_1 = __importDefault(require("./routes/auth"));
const chat_1 = __importDefault(require("./routes/chat"));
const user_1 = __importDefault(require("./routes/user"));
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
// Socket.IO setup
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true,
    },
    transports: ['websocket', 'polling'],
});
app.use((0, helmet_1.default)({
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "https://accounts.google.com", "https://apis.google.com", "https://ssl.gstatic.com", "https://www.gstatic.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://accounts.google.com", "https://fonts.googleapis.com", "https://ssl.gstatic.com", "https://www.gstatic.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            frameSrc: ["'self'", "https://accounts.google.com", "https://gsi.client-channel.google.com"],
            connectSrc: ["'self'", "https://accounts.google.com", "https://gsi.client-channel.google.com", "wss:", "ws:"],
            imgSrc: ["'self'", "data:", "https:", "blob:", "https://ssl.gstatic.com", "https://www.gstatic.com", "https://lh3.googleusercontent.com"],
        },
    },
}));
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
}));
app.use(express_1.default.json());
// Rate limiting for API
const apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', apiLimiter);
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// API Routes
app.use('/api/auth', auth_1.default);
app.use('/api/chats', chat_1.default);
app.use('/api/users', user_1.default);
// Serve static frontend files in production
if (process.env.NODE_ENV === 'production') {
    const publicPath = path_1.default.join(__dirname, '../public');
    app.use(express_1.default.static(publicPath));
    // Handle SPA routing - serve index.html for all non-API routes
    // Express 5 uses new path-to-regexp syntax: {*path} instead of *
    app.get('/{*path}', (req, res, next) => {
        // Skip API routes and health check
        if (req.path.startsWith('/api') || req.path === '/health') {
            return next();
        }
        res.sendFile(path_1.default.join(publicPath, 'index.html'));
    });
}
// Error handling
app.use(errorHandler_1.notFound);
app.use(errorHandler_1.errorHandler);
// Setup Socket.IO handlers
(0, socket_1.setupSocketHandlers)(io);
// Start server
const PORT = parseInt(process.env.PORT || '3001', 10);
async function start() {
    try {
        // Connect to database
        await (0, database_1.connectDatabase)();
        // Start HTTP server
        httpServer.listen(PORT, () => {
            console.log(`
🚀 EPHEXA Backend Server Started
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 Server:    http://localhost:${PORT}
🔌 Socket.IO: ws://localhost:${PORT}
🌐 CORS:      ${process.env.CORS_ORIGIN || 'http://localhost:5173'}
📂 Environment: ${process.env.NODE_ENV || 'development'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}
// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    httpServer.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});
start();
//# sourceMappingURL=app.js.map