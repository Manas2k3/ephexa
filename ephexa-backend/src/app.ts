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

// Middleware
app.use(helmet());
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

// Serve static frontend files in production
if (process.env.NODE_ENV === 'production') {
    const publicPath = path.join(__dirname, '../public');
    app.use(express.static(publicPath));

    // Handle SPA routing - serve index.html for all non-API routes
    app.get('*', (req, res, next) => {
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
