import express from 'express';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import { createServer } from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import routes
import ordersRouter from './routes/orders.js';
import menuRouter from './routes/menu.js';
import feedbackRouter from './routes/feedback.js';
import balanceRouter from './routes/balance.js';
import analyticsRouter from './routes/analytics.js';
import usersRouter from './routes/users.js';
import giftcardsRouter from './routes/giftcards.js';
import socialRouter from './routes/social.js';
import authRouter from './routes/auth.js';
import selfiesRouter from './routes/selfies.js';
import paymentRouter from './routes/payment.js';
import adminRouter from './routes/admin.js';
import adminEnhancedRouter from './routes/adminEnhanced.js';
import auditLogsRouter from './routes/auditLogs.js';

// Import middleware
import { apiLimiter, authLimiter } from './middleware/rateLimiter.js';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);

// Socket.io setup dengan CORS
const io = new Server(httpServer, {
    cors: {
        origin: "*", // Allow all for development
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true
    }
});

// Middleware
const allowedOrigins = [
    process.env.CORS_ORIGIN || 'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:4173'
];

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            return callback(null, true); // Allow all in dev for now to fix connection
        }
        return callback(null, true);
    },
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url} - Origin: ${req.get('origin')}`);
    next();
});

// Apply rate limiting to all API routes
app.use('/api/', apiLimiter);

// Make io accessible in routes
app.set('io', io);

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in environment variables!');
    process.exit(1);
}

mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/auth', authLimiter, authRouter); // Apply strict rate limiting to auth
app.use('/api/orders', ordersRouter);
app.use('/api/menu', menuRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api/balance', balanceRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/users', usersRouter);
app.use('/api/giftcards', giftcardsRouter);
app.use('/api/social', socialRouter);
app.use('/api/selfies', selfiesRouter);
app.use('/api/payment', paymentRouter);
app.use('/api/admin', adminRouter);
app.use('/api/admin-enhanced', adminEnhancedRouter); // New enhanced admin routes
app.use('/api/audit-logs', auditLogsRouter); // Audit logging routes

// Serve Admin Panel
app.use('/admin', express.static(path.join(__dirname, '../../admin-panel')));

// Serve static files from the Main App (Build)
app.use(express.static(path.join(__dirname, '../../build')));

// The "catchall" handler
app.get('*', (req, res, next) => {
    // If it's an API call that wasn't caught, let it fall through to 404
    if (req.path.startsWith('/api')) return next();

    // If it's an admin path, send admin index
    if (req.path.startsWith('/admin')) {
        return res.sendFile(path.join(__dirname, '../../admin-panel/index.html'));
    }

    // Otherwise send main app index
    res.sendFile(path.join(__dirname, '../../build/index.html'));
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Socket.io connection handler
io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    socket.on('disconnect', () => {
        console.log(`❌ Client disconnected: ${socket.id}`);
    });

    // Optional: Join room based on role
    socket.on('joinRole', (role) => {
        socket.join(role);
        console.log(`👤 ${socket.id} joined ${role} room`);
    });
});

// Start server
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Socket.io ready for connections`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
