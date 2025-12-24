import { Router } from 'express';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';
import { FeedbackService } from '../services/feedback.service';
import { successResponse, createdResponse, errorResponse, serverErrorResponse } from '../utils/response';

const router = Router();
const feedbackService = new FeedbackService();

// GET /api/feedback/reviews - Get public approved reviews (no auth required)
router.get('/reviews', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit as string) || 10;
        const reviews = await feedbackService.getPublicReviews(limit);
        return successResponse(res, reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return serverErrorResponse(res);
    }
});

// POST /api/feedback - Submit feedback (optional auth - can be anonymous)
router.post('/', optionalAuthMiddleware, async (req, res) => {
    try {
        const { name, avatar, rating, comment } = req.body;

        if (!rating || !comment) {
            return errorResponse(res, 'Bad Request', 'Rating and comment are required');
        }

        if (rating < 1 || rating > 5) {
            return errorResponse(res, 'Bad Request', 'Rating must be between 1 and 5');
        }

        const userId = req.user?.id || null;
        const feedback = await feedbackService.createOrUpdate(userId, {
            name,
            avatar,
            rating,
            comment,
        });

        return createdResponse(res, feedback);
    } catch (error) {
        console.error('Error submitting feedback:', error);
        return serverErrorResponse(res);
    }
});

// GET /api/feedback/my - Get current user's feedback (auth required)
router.get('/my', authMiddleware, async (req, res) => {
    try {
        const feedback = await feedbackService.getByUser(req.user!.id);
        return successResponse(res, feedback);
    } catch (error) {
        console.error('Error fetching user feedback:', error);
        return serverErrorResponse(res);
    }
});

// ===== Admin Routes =====

// GET /api/feedback/admin - Get all feedback for admin (admin only)
router.get('/admin', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const filter = req.query.filter as 'pending' | 'approved' | 'all';
        const feedback = await feedbackService.getAllForAdmin(filter);
        return successResponse(res, feedback);
    } catch (error) {
        console.error('Error fetching feedback for admin:', error);
        return serverErrorResponse(res);
    }
});

// PATCH /api/feedback/admin/:id/approve - Approve feedback (admin only)
router.patch('/admin/:id/approve', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const feedback = await feedbackService.approve(req.params.id);
        return successResponse(res, feedback);
    } catch (error) {
        console.error('Error approving feedback:', error);
        return serverErrorResponse(res);
    }
});

// DELETE /api/feedback/admin/:id - Delete feedback (admin only)
router.delete('/admin/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        await feedbackService.delete(req.params.id);
        return successResponse(res, { deleted: true });
    } catch (error) {
        console.error('Error deleting feedback:', error);
        return serverErrorResponse(res);
    }
});

export default router;
