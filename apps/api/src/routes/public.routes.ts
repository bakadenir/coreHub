import { Router } from 'express';
import { NotesService } from '../services/notes.service';
import { successResponse, notFoundResponse, serverErrorResponse } from '../utils/response';

const router = Router();
const notesService = new NotesService();

// GET /api/public/notes/:slug - Get public note by slug (no auth required)
router.get('/notes/:slug', async (req, res) => {
    try {
        const note = await notesService.findBySlug(req.params.slug);
        if (!note) {
            return notFoundResponse(res, 'Article');
        }
        return successResponse(res, note);
    } catch (error) {
        console.error('Error fetching public note:', error);
        return serverErrorResponse(res);
    }
});

export default router;
