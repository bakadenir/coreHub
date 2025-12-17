import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { UsersService } from '../services/users.service';
import { successResponse, serverErrorResponse } from '../utils/response';

const router = Router();
const usersService = new UsersService();

router.use(authMiddleware);

// GET /api/users/me - Get current user profile
router.get('/me', async (req, res) => {
    try {
        const user = await usersService.findById(req.user!.id);
        return successResponse(res, user);
    } catch (error) {
        console.error('Error fetching user:', error);
        return serverErrorResponse(res);
    }
});

// PATCH /api/users/me - Update profile
router.patch('/me', async (req, res) => {
    try {
        const { name, bio, avatar } = req.body;
        const user = await usersService.update(req.user!.id, { name, bio, avatar });
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
