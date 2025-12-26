import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { NotesService } from '../services/notes.service';
import { successResponse, createdResponse, notFoundResponse, serverErrorResponse } from '../utils/response';

const router = Router();
const notesService = new NotesService();

router.use(authMiddleware);

// GET /api/notes - List all notes
router.get('/', async (req, res) => {
    try {
        const { tag, search, sort } = req.query;
        const notes = await notesService.findAll(req.user!.id, {
            tag: tag as string,
            search: search as string,
            sort: sort as 'created' | 'updated' | 'title',
        });
        return successResponse(res, notes);
    } catch (error) {
        console.error('Error fetching notes:', error);
        return serverErrorResponse(res);
    }
});

// POST /api/notes - Create new note
router.post('/', async (req, res) => {
    try {
        const note = await notesService.create(req.user!.id, req.body);
        return createdResponse(res, note);
    } catch (error) {
        console.error('Error creating note:', error);
        return serverErrorResponse(res);
    }
});

// GET /api/notes/:id - Get single note
router.get('/:id', async (req, res) => {
    try {
        const note = await notesService.findById(req.params.id, req.user!.id);
        if (!note) {
            return notFoundResponse(res, 'Note');
        }
        return successResponse(res, note);
    } catch (error) {
        console.error('Error fetching note:', error);
        return serverErrorResponse(res);
    }
});

// PATCH /api/notes/:id - Update note
router.patch('/:id', async (req, res) => {
    try {
        const note = await notesService.update(req.params.id, req.user!.id, req.body);
        if (!note) {
            return notFoundResponse(res, 'Note');
        }
        return successResponse(res, note);
    } catch (error) {
        console.error('Error updating note:', error);
        return serverErrorResponse(res);
    }
});

// DELETE /api/notes/:id - Soft delete note
router.delete('/:id', async (req, res) => {
    try {
        await notesService.softDelete(req.params.id, req.user!.id);
        return successResponse(res, { deleted: true });
    } catch (error) {
        console.error('Error deleting note:', error);
        return serverErrorResponse(res);
    }
});

// PATCH /api/notes/:id/pin - Pin/unpin note
router.patch('/:id/pin', async (req, res) => {
    try {
        const { isPinned } = req.body;
        const note = await notesService.setPin(req.params.id, req.user!.id, isPinned);
        if (!note) {
            return notFoundResponse(res, 'Note');
        }
        return successResponse(res, note);
    } catch (error) {
        console.error('Error pinning note:', error);
        return serverErrorResponse(res);
    }
});

export default router;
