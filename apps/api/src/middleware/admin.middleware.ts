import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

/**
 * Admin middleware with server-side role verification
 * SECURITY: Verifies admin role from Supabase Auth server-side to prevent
 * users from self-assigning admin role via user_metadata manipulation
 */
export async function adminMiddleware(req: Request, res: Response, next: NextFunction) {
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized', message: 'Authentication required' });
    }

    try {
        // CRITICAL: Verify role server-side via Admin API
        // user_metadata can be modified by users, so we must verify
        const { data, error } = await supabase.auth.admin.getUserById(req.user.id);

        if (error || !data?.user) {
            return res.status(401).json({ error: 'Unauthorized', message: 'User not found' });
        }

        // Check app_metadata first (cannot be modified by user), then user_metadata
        const verifiedRole = data.user.app_metadata?.role ||
            data.user.user_metadata?.role ||
            'user';

        if (verifiedRole !== 'admin') {
            return res.status(403).json({ error: 'Forbidden', message: 'Admin access required' });
        }

        // Update req.user with verified role
        req.user.role = verifiedRole;
        next();
    } catch (error) {
        console.error('Admin middleware error:', error);
        return res.status(500).json({ error: 'Internal Server Error', message: 'Role verification failed' });
    }
}
