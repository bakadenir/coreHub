import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { UsersService } from '../services/users.service';
import { createWelcomeNotificationIfNeeded } from '../services/notifications.service';
import { successResponse, serverErrorResponse } from '../utils/response';

const router = Router();
const usersService = new UsersService();

// Transform Supabase user to flat structure for frontend
function transformUser(user: any) {
    return {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.user_metadata?.username || null,
        username: user.user_metadata?.username || user.user_metadata?.name || null,
        bio: user.user_metadata?.bio || null,
        location: user.user_metadata?.location || null,
        image: user.user_metadata?.image || null,
        role: user.user_metadata?.role || user.role || 'user',
        createdAt: user.created_at,
    };
}

router.use(authMiddleware);

// GET /api/users/me - Get current user profile
router.get('/me', async (req, res) => {
    try {
        const user = await usersService.findById(req.user!.id);

        // Create welcome notification for new users (idempotent)
        const userName = user?.user_metadata?.name || user?.user_metadata?.username;
        createWelcomeNotificationIfNeeded(req.user!.id, userName).catch(err => {
            console.error('Error creating welcome notification:', err);
        });

        return successResponse(res, transformUser(user));
    } catch (error) {
        console.error('Error fetching user:', error);
        return serverErrorResponse(res);
    }
});

// PATCH /api/users/me - Update profile (name, bio, location)
// Note: Avatar is uploaded separately via /api/upload/avatar
router.patch('/me', async (req, res) => {
    try {
        const { name, bio, location } = req.body;

        // Build update object only with defined values
        const updateData: Record<string, any> = {};
        if (name !== undefined) updateData.name = name;
        if (bio !== undefined) updateData.bio = bio;
        if (location !== undefined) updateData.location = location;

        console.log('Update profile request:', { userId: req.user!.id, updateData });

        const user = await usersService.update(req.user!.id, updateData);
        return successResponse(res, user);
    } catch (error) {
        console.error('Error updating user:', error);
        return serverErrorResponse(res);
    }
});

// PATCH /api/users/me/username - Update username
router.patch('/me/username', async (req, res) => {
    try {
        const { username } = req.body;
        const user = await usersService.updateUsername(req.user!.id, username);
        return successResponse(res, user);
    } catch (error: any) {
        if (error.message === 'Username already taken') {
            return res.status(409).json({ error: 'Conflict', message: 'Username already taken' });
        }
        console.error('Error updating username:', error);
        return serverErrorResponse(res);
    }
});

// DELETE /api/users/me - Soft delete account
router.delete('/me', async (req, res) => {
    try {
        await usersService.softDelete(req.user!.id);
        return successResponse(res, { deleted: true });
    } catch (error) {
        console.error('Error deleting user:', error);
        return serverErrorResponse(res);
    }
});

export default router;
