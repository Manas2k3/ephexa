import 'dotenv/config';
import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server } from 'socket.io';
import rateLimit from 'express-rate-limit';

import { connectDatabase } from './config/database';
import { errorHandler, notFound } from './middleware/errorHandler';
import { setupSocketHandlers } from './socket';

// Routes
import authRoutes from './routes/auth';
import chatRoutes from './routes/chat';
import userRoutes from './routes/user';
import friendRoutes from './routes/friends';

// Types
import type {
    ServerToClientEvents,
    ClientToServerEvents,
    InterServerEvents,
    SocketData
} from './types';

const app = express();
const httpServer = createServer(app);

// Socket.IO setup
const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(httpServer, {
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true,
    },
    transports: ['websocket', 'polling'],
});

app.use(helmet({
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
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());

// Rate limiting for API
const apiLimiter = rateLimit({
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
app.use('/api/auth', authRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/users', userRoutes);
app.use('/api/friends', friendRoutes);

// Serve static frontend files in production
if (process.env.NODE_ENV === 'production') {
    const publicPath = path.join(__dirname, '../public');
    app.use(express.static(publicPath));

    // Handle SPA routing - serve index.html for all non-API routes
    // Express 5 uses new path-to-regexp syntax: {*path} instead of *
    app.get('/{*path}', (req, res, next) => {
        // Skip API routes and health check
        if (req.path.startsWith('/api') || req.path === '/health') {
            return next();
        }
        res.sendFile(path.join(publicPath, 'index.html'));
    });
}

// Error handling
app.use(notFound);
app.use(errorHandler);

// Setup Socket.IO handlers
setupSocketHandlers(io);

// Start server
const PORT = parseInt(process.env.PORT || '3001', 10);

async function start() {
    try {
        // Connect to database
        await connectDatabase();

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
    } catch (error) {
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
