import express from 'express';
import cors from 'cors';
import path from 'path';
import { env } from './config/env';
import { auth } from './config/auth';
import { toNodeHandler } from 'better-auth/node';

// Import routes
import habitsRouter from './routes/habits.routes';
import schedulesRouter from './routes/schedules.routes';
import notesRouter from './routes/notes.routes';
import linksRouter from './routes/links.routes';
import usersRouter from './routes/users.routes';
import adminRouter from './routes/admin.routes';
import searchRouter from './routes/search.routes';
import uploadRouter from './routes/upload.routes';
import authCustomRouter from './routes/auth-custom.routes';

const app = express();

// Middleware
app.use(cors({
    origin: env.FRONTEND_URL,
    credentials: true,
}));
app.use(express.json({ limit: '2mb' }));  // Increased for base64 images

// Static file serving for uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Better Auth handler - handles all /api/auth/* routes
app.all('/api/auth/*', toNodeHandler(auth));

// API Routes
app.use('/api/habits', habitsRouter);
app.use('/api/schedules', schedulesRouter);
app.use('/api/notes', notesRouter);
app.use('/api/links', linksRouter);
app.use('/api/users', usersRouter);
app.use('/api/admin', adminRouter);
app.use('/api/search', searchRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/auth-custom', authCustomRouter);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
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
});

export default app;
