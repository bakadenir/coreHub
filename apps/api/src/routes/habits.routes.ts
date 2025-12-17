import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { HabitsService } from '../services/habits.service';
import { successResponse, createdResponse, notFoundResponse, serverErrorResponse } from '../utils/response';

const router = Router();
const habitsService = new HabitsService();

// All routes require authentication
router.use(authMiddleware);

// GET /api/habits - List all habits
router.get('/', async (req: Request, res: Response) => {
    try {
        const { frequency, category, archived, date } = req.query;
        const habits = await habitsService.findAll(req.user!.id, {
            frequency: frequency as string,
            category: category as string,
            archived: archived === 'true',
            date: date as string,
        });
        return successResponse(res, habits);
    } catch (error) {
        console.error('Error fetching habits:', error);
        return serverErrorResponse(res);
    }
});

// GET /api/habits/stats - Get habit statistics
router.get('/stats', async (req, res) => {
    try {
        const stats = await habitsService.getStats(req.user!.id);
        return successResponse(res, stats);
    } catch (error) {
        console.error('Error fetching habit stats:', error);
        return serverErrorResponse(res);
    }
});

// POST /api/habits - Create new habit
router.post('/', async (req, res) => {
    try {
        const habit = await habitsService.create(req.user!.id, req.body);
        return createdResponse(res, habit);
    } catch (error) {
        console.error('Error creating habit:', error);
        return serverErrorResponse(res);
    }
});

// GET /api/habits/:id - Get single habit
router.get('/:id', async (req, res) => {
    try {
        const habit = await habitsService.findById(req.params.id, req.user!.id);
        if (!habit) {
            return notFoundResponse(res, 'Habit');
        }
        return successResponse(res, habit);
    } catch (error) {
        console.error('Error fetching habit:', error);
        return serverErrorResponse(res);
    }
});

// PATCH /api/habits/:id - Update habit
router.patch('/:id', async (req, res) => {
    try {
        const habit = await habitsService.update(req.params.id, req.user!.id, req.body);
        if (!habit) {
            return notFoundResponse(res, 'Habit');
        }
        return successResponse(res, habit);
    } catch (error) {
        console.error('Error updating habit:', error);
        return serverErrorResponse(res);
    }
});

// DELETE /api/habits/:id - Soft delete habit
router.delete('/:id', async (req, res) => {
    try {
        await habitsService.softDelete(req.params.id, req.user!.id);
        return successResponse(res, { deleted: true });
    } catch (error) {
        console.error('Error deleting habit:', error);
        return serverErrorResponse(res);
    }
});

// POST /api/habits/:id/complete - Mark habit as completed
router.post('/:id/complete', async (req, res) => {
    try {
        const { date } = req.body;
        const completion = await habitsService.markComplete(req.params.id, req.user!.id, date ? new Date(date) : new Date());
        return createdResponse(res, completion);
    } catch (error) {
        console.error('Error completing habit:', error);
        return serverErrorResponse(res);
    }
});

// DELETE /api/habits/:id/complete - Unmark habit completion
router.delete('/:id/complete', async (req, res) => {
    try {
        const { date } = req.query;
        await habitsService.unmarkComplete(req.params.id, req.user!.id, date ? new Date(date as string) : new Date());
        return successResponse(res, { uncompleted: true });
    } catch (error) {
        console.error('Error uncompleting habit:', error);
        return serverErrorResponse(res);
    }
});

// PATCH /api/habits/:id/archive - Archive/unarchive habit
router.patch('/:id/archive', async (req, res) => {
    try {
        const { archived } = req.body;
        const habit = await habitsService.setArchived(req.params.id, req.user!.id, archived);
        return successResponse(res, habit);
    } catch (error) {
        console.error('Error archiving habit:', error);
        return serverErrorResponse(res);
    }
});

export default router;
