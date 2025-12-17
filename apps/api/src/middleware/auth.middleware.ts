import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/auth';
import { fromNodeHeaders } from 'better-auth/node';

// Extend Express Request type to include user session
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                name: string;
                role: string;
            };
            session?: {
                id: string;
                userId: string;
                expiresAt: Date;
            };
        }
    }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        });

        if (!session) {
            return res.status(401).json({ error: 'Unauthorized', message: 'No valid session found' });
        }

        req.user = {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name,
            role: (session.user as any).role || 'user',
        };
        req.session = {
            id: session.session.id,
            userId: session.session.userId,
            expiresAt: session.session.expiresAt,
        };

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({ error: 'Unauthorized', message: 'Authentication failed' });
    }
}

export function optionalAuthMiddleware(req: Request, res: Response, next: NextFunction) {
    auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
    }).then((session) => {
        if (session) {
            req.user = {
                id: session.user.id,
                email: session.user.email,
                name: session.user.name,
                role: (session.user as any).role || 'user',
            };
            req.session = {
                id: session.session.id,
                userId: session.session.userId,
                expiresAt: session.session.expiresAt,
            };
        }
        next();
    }).catch(() => {
        next();
    });
}
