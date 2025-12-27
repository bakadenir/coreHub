import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

// Extend Express Request type to include user session
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                name?: string;
                role?: string;
            };
        }
    }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        // Get token from Authorization header or query parameter (for SSE)
        let token: string | undefined;

        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        } else if (req.query.token && typeof req.query.token === 'string') {
            // Support token in query parameter for SSE (EventSource doesn't support headers)
            token = req.query.token;
        }

        if (!token) {
            return res.status(401).json({ error: 'Unauthorized', message: 'No valid token provided' });
        }

        // Verify token with Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired token' });
        }

        // Get user metadata from Supabase
        req.user = {
            id: user.id,
            email: user.email!,
            name: user.user_metadata?.name || user.user_metadata?.username,
            role: user.user_metadata?.role || 'user',
        };

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({ error: 'Unauthorized', message: 'Authentication failed' });
    }
}

export async function optionalAuthMiddleware(req: Request, _res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const { data: { user } } = await supabase.auth.getUser(token);

            if (user) {
                req.user = {
                    id: user.id,
                    email: user.email!,
                    name: user.user_metadata?.name || user.user_metadata?.username,
                    role: user.user_metadata?.role || 'user',
                };
            }
        }
        next();
    } catch {
        // Silently proceed without user
        next();
    }
}
