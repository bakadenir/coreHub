import express from 'express';
import cors from 'cors';
import path from 'path';
import { env } from './config/env';

// Import routes
import habitsRouter from './routes/habits.routes';
import schedulesRouter from './routes/schedules.routes';
import notesRouter from './routes/notes.routes';
import linksRouter from './routes/links.routes';
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

// Middleware
app.use(cors({
    origin: env.FRONTEND_URL,
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
app.use('/api/users', usersRouter);
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

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
app.listen(env.PORT, () => {
    console.log(`🚀 Server running on http://localhost:${env.PORT}`);
    console.log(`📚 API Docs: http://localhost:${env.PORT}/api/health`);

    // Start the notification scheduler
    startScheduler();
});

export default app;
