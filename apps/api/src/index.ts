import express from 'express';
import cors from 'cors';
import path from 'path';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { initSentry, Sentry } from './config/sentry';
import { swaggerSpec } from './config/swagger';

// Initialize Sentry for error tracking (must be first!)
initSentry();

// Import routes
import habitsRouter from './routes/habits.routes';
import schedulesRouter from './routes/schedules.routes';
import notesRouter from './routes/notes.routes';
import linksRouter from './routes/links.routes';
import todosRouter from './routes/todos.routes';
import usersRouter from './routes/users.routes';
import adminRouter from './routes/admin.routes';
import searchRouter from './routes/search.routes';
import uploadRouter from './routes/upload.routes';
import notificationsRouter from './routes/notifications.routes';
import pushRouter from './routes/push.routes';
import notificationSettingsRouter from './routes/notification-settings.routes';
import sseRouter from './routes/sse.routes';
import feedbackRouter from './routes/feedback.routes';
import donationsRouter from './routes/donations.routes';
import publicRouter from './routes/public.routes';

// Import scheduler
import { startScheduler } from './services/scheduler.service';

const app = express();

// Performance: Gzip compression for responses (60-80% size reduction)
app.use(compression({
    level: 6, // Balanced compression level
    threshold: 1024, // Only compress responses > 1KB
    filter: (req, res) => {
        // Don't compress SSE streams
        if (req.path.includes('/sse')) return false;
        return compression.filter(req, res);
    },
}));

// Security: Helmet for HTTP security headers
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow cross-origin for assets
    contentSecurityPolicy: false, // Disable CSP as frontend handles it
}));

// Security: Rate limiting to prevent DDoS attacks
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // Limit each IP to 500 requests per windowMs (increased for normal usage)
    message: { error: 'Too many requests', message: 'Please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path.includes('/sse'), // Skip rate limit for SSE connections
});

// Stricter rate limit for auth-related endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit each IP to 20 auth requests per windowMs
    message: { error: 'Too many login attempts', message: 'Please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply rate limiting to all API routes
app.use('/api/', generalLimiter);

// Middleware - CORS must include all production domains
app.use(cors({
    origin: [
        env.FRONTEND_URL,
        'https://corehub.life',  // Production frontend
        'http://localhost:5173',
        'http://localhost:5174',
    ],
    credentials: true,
}));
app.use(express.json({ limit: '2mb' }));  // Increased for base64 images

// Static file serving for uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// API Routes
app.use('/api/habits', habitsRouter);
app.use('/api/schedules', schedulesRouter);
app.use('/api/notes', notesRouter);
app.use('/api/links', linksRouter);
app.use('/api/todos', todosRouter);
app.use('/api/users', authLimiter, usersRouter);
app.use('/api/admin', adminRouter);
app.use('/api/search', searchRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/push', pushRouter);
app.use('/api/notification-settings', notificationSettingsRouter);
app.use('/api/sse', sseRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api/donations', donationsRouter);
app.use('/api/public', publicRouter);

// Health check
app.get('/api/health', (_, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Documentation (Swagger)
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'coreHub API Docs',
}));

// Swagger JSON spec
app.get('/api/docs.json', (_, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

// Error handler with Sentry
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    // Report error to Sentry in production
    Sentry.captureException(err);
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
const server = app.listen(env.PORT, () => {
    console.log(`🚀 Server running on http://localhost:${env.PORT}`);
    console.log(`📚 API Docs: http://localhost:${env.PORT}/api/health`);

    // Start the notification scheduler
    startScheduler();
});

// Configure keep-alive for better connection stability
server.keepAliveTimeout = 65000; // 65 seconds (slightly higher than typical load balancer timeouts)
server.headersTimeout = 66000; // Slightly higher than keepAliveTimeout

// Graceful shutdown handling
const gracefulShutdown = (signal: string) => {
    console.log(`\n⚠️  Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
        console.log('✅ Server closed. Exiting process.');
        process.exit(0);
    });

    // Force close after 10 seconds
    setTimeout(() => {
        console.error('❌ Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default app;
