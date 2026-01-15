import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { NotesService } from '../services/notes.service';
import { successResponse, notFoundResponse, serverErrorResponse } from '../utils/response';

const router = Router();
const notesService = new NotesService();

// Rate limiting for public endpoints - prevent abuse
const publicRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per IP per window
    message: { error: 'Too many requests', message: 'Please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});

router.use(publicRateLimiter);

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

