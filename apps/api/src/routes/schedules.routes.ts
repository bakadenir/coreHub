import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { SchedulesService } from '../services/schedules.service';
import { successResponse, createdResponse, notFoundResponse, serverErrorResponse } from '../utils/response';

const router = Router();
const schedulesService = new SchedulesService();

router.use(authMiddleware);

// GET /api/schedules - List events
router.get('/', async (req, res) => {
    try {
        const { startDate, endDate, view } = req.query;
        const events = await schedulesService.findAll(req.user!.id, {
            startDate: startDate as string,
            endDate: endDate as string,
            view: view as 'day' | 'week' | 'month',
        });
        return successResponse(res, events);
    } catch (error) {
        console.error('Error fetching schedules:', error);
        return serverErrorResponse(res);
    }
});

// GET /api/schedules/agenda - Get upcoming agenda
router.get('/agenda', async (req, res) => {
    try {
        const agenda = await schedulesService.getAgenda(req.user!.id);
        return successResponse(res, agenda);
    } catch (error) {
        console.error('Error fetching agenda:', error);
        return serverErrorResponse(res);
    }
});

// POST /api/schedules - Create event
router.post('/', async (req, res) => {
    try {
        const event = await schedulesService.create(req.user!.id, req.body);
        return createdResponse(res, event);
    } catch (error) {
        console.error('Error creating schedule:', error);
        return serverErrorResponse(res);
    }
});

// GET /api/schedules/:id - Get single event
router.get('/:id', async (req, res) => {
    try {
        const event = await schedulesService.findById(req.params.id, req.user!.id);
        if (!event) {
            return notFoundResponse(res, 'Schedule event');
        }
        return successResponse(res, event);
    } catch (error) {
        console.error('Error fetching schedule:', error);
        return serverErrorResponse(res);
    }
});

// PATCH /api/schedules/:id - Update event
router.patch('/:id', async (req, res) => {
    try {
        const event = await schedulesService.update(req.params.id, req.user!.id, req.body);
        if (!event) {
            return notFoundResponse(res, 'Schedule event');
        }
        return successResponse(res, event);
    } catch (error) {
        console.error('Error updating schedule:', error);
        return serverErrorResponse(res);
    }
});

// DELETE /api/schedules/:id - Delete event
router.delete('/:id', async (req, res) => {
    try {
        await schedulesService.delete(req.params.id, req.user!.id);
        return successResponse(res, { deleted: true });
    } catch (error) {
        console.error('Error deleting schedule:', error);
        return serverErrorResponse(res);
    }
});

export default router;
