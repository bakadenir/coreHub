import { Router, Request, Response } from 'express';
import { db } from '../config/database';
import { user, session } from '../db/schema';
import { eq, or } from 'drizzle-orm';
import { successResponse, errorResponse, serverErrorResponse } from '../utils/response';
import { auth } from '../config/auth';

const router = Router();

// POST /api/auth-custom/set-username - Set username after registration
// This requires a valid session cookie
router.post('/set-username', async (req: Request, res: Response) => {
    try {
        const { username } = req.body;

        if (!username || username.trim().length < 3) {
            return errorResponse(res, 'Bad Request', 'Username must be at least 3 characters');
        }

        // Get session from cookie
        const sessionResult = await auth.api.getSession({ headers: req.headers as any });
        if (!sessionResult?.user) {
            return errorResponse(res, 'Unauthorized', 'No valid session');
        }

        const userId = sessionResult.user.id;

        // Check if username already taken
        const existingUser = await db.query.user.findFirst({
            where: eq(user.username, username.trim()),
        });

        if (existingUser && existingUser.id !== userId) {
            return errorResponse(res, 'Conflict', 'Username already taken');
        }

        // Update username
        await db.update(user)
            .set({ username: username.trim(), updatedAt: new Date() })
            .where(eq(user.id, userId));

        return successResponse(res, { success: true });
    } catch (error) {
        console.error('Error setting username:', error);
        return serverErrorResponse(res);
    }
});

// POST /api/auth-custom/login - Login with email OR username
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { identifier, password } = req.body;

        if (!identifier || !password) {
            return errorResponse(res, 'Bad Request', 'Email/username and password are required');
        }

        // Check if identifier is email or username
        const isEmail = identifier.includes('@');

        // Find user by email or username
        const foundUser = await db.query.user.findFirst({
            where: isEmail
                ? eq(user.email, identifier)
                : eq(user.username, identifier),
        });

        if (!foundUser) {
            return errorResponse(res, 'Unauthorized', 'Invalid credentials');
        }

        // Use better-auth's signIn with the found email
        // We redirect to the standard better-auth login with email
        return successResponse(res, {
            email: foundUser.email,
            // Tell frontend to use this email for the actual login
        });
    } catch (error) {
        console.error('Error in custom login:', error);
        return serverErrorResponse(res);
    }
});

export default router;
