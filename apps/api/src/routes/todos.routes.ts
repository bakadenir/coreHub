import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { TodosService } from '../services/todos.service';
import { successResponse, createdResponse, notFoundResponse, serverErrorResponse } from '../utils/response';

const router = Router();
const todosService = new TodosService();

// All routes require authentication
router.use(authMiddleware);

// ========== TODOS ==========

// GET /api/todos - List all todos
router.get('/', async (req: Request, res: Response) => {
    try {
        const { listId, completed, priority, dueDate, search } = req.query;
        const todos = await todosService.findAll(req.user!.id, {
            listId: listId as string,
            completed: completed === 'true' ? true : completed === 'false' ? false : undefined,
            priority: priority as string,
            dueDate: dueDate as 'today' | 'upcoming' | 'overdue' | 'no-date',
            search: search as string,
        });
        return successResponse(res, todos);
    } catch (error) {
        console.error('Error fetching todos:', error);
        return serverErrorResponse(res);
    }
});

// GET /api/todos/stats - Get todo statistics
router.get('/stats', async (req, res) => {
    try {
        const stats = await todosService.getStats(req.user!.id);
        return successResponse(res, stats);
    } catch (error) {
        console.error('Error fetching todo stats:', error);
        return serverErrorResponse(res);
    }
});

// POST /api/todos - Create new todo
router.post('/', async (req, res) => {
    try {
        const todo = await todosService.create(req.user!.id, req.body);
        return createdResponse(res, todo);
    } catch (error: any) {
        console.error('Error creating todo:', error);
        return res.status(500).json({ success: false, error: error?.message || 'Server error' });
    }
});

// GET /api/todos/:id - Get single todo
router.get('/:id', async (req, res) => {
    try {
        const todo = await todosService.findById(req.params.id, req.user!.id);
        if (!todo) {
            return notFoundResponse(res, 'Todo');
        }
        return successResponse(res, todo);
    } catch (error) {
        console.error('Error fetching todo:', error);
        return serverErrorResponse(res);
    }
});

// PATCH /api/todos/:id - Update todo
router.patch('/:id', async (req, res) => {
    try {
        const todo = await todosService.update(req.params.id, req.user!.id, req.body);
        if (!todo) {
            return notFoundResponse(res, 'Todo');
        }
        return successResponse(res, todo);
    } catch (error) {
        console.error('Error updating todo:', error);
        return serverErrorResponse(res);
    }
});

// POST /api/todos/:id/toggle - Toggle todo completion
router.post('/:id/toggle', async (req, res) => {
    try {
        const todo = await todosService.toggleComplete(req.params.id, req.user!.id);
        return successResponse(res, todo);
    } catch (error) {
        console.error('Error toggling todo:', error);
        return serverErrorResponse(res);
    }
});

// DELETE /api/todos/:id - Soft delete todo
router.delete('/:id', async (req, res) => {
    try {
        await todosService.softDelete(req.params.id, req.user!.id);
        return successResponse(res, { deleted: true });
    } catch (error) {
        console.error('Error deleting todo:', error);
        return serverErrorResponse(res);
    }
});

// POST /api/todos/reorder - Reorder todos
router.post('/reorder', async (req, res) => {
    try {
        const { todoIds } = req.body;
        await todosService.reorder(req.user!.id, todoIds);
        return successResponse(res, { reordered: true });
    } catch (error) {
        console.error('Error reordering todos:', error);
        return serverErrorResponse(res);
    }
});

// ========== TODO LISTS ==========

// GET /api/todos/lists - Get all lists
router.get('/lists/all', async (req, res) => {
    try {
        const result = await todosService.findAllLists(req.user!.id);
        return successResponse(res, result);
    } catch (error) {
        console.error('Error fetching todo lists:', error);
        return serverErrorResponse(res);
    }
});

// POST /api/todos/lists - Create new list
router.post('/lists', async (req, res) => {
    try {
        const list = await todosService.createList(req.user!.id, req.body);
        return createdResponse(res, list);
    } catch (error: any) {
        console.error('Error creating todo list:', error);
        return res.status(500).json({ success: false, error: error?.message || 'Server error' });
    }
});

// PATCH /api/todos/lists/:id - Update list
router.patch('/lists/:id', async (req, res) => {
    try {
        const list = await todosService.updateList(req.params.id, req.user!.id, req.body);
        return successResponse(res, list);
    } catch (error) {
        console.error('Error updating todo list:', error);
        return serverErrorResponse(res);
    }
});

// POST /api/todos/lists/:id/reset - Reset list (uncomplete all todos)
router.post('/lists/:id/reset', async (req, res) => {
    try {
        const result = await todosService.resetList(req.params.id, req.user!.id);
        return successResponse(res, result);
    } catch (error) {
        console.error('Error resetting todo list:', error);
        return serverErrorResponse(res);
    }
});

// DELETE /api/todos/lists/:id - Delete list
router.delete('/lists/:id', async (req, res) => {
    try {
        await todosService.deleteList(req.params.id, req.user!.id);
        return successResponse(res, { deleted: true });
    } catch (error) {
        console.error('Error deleting todo list:', error);
        return serverErrorResponse(res);
    }
});

export default router;
