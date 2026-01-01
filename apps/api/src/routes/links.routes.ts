import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { LinksService } from '../services/links.service';
import { successResponse, createdResponse, notFoundResponse, serverErrorResponse } from '../utils/response';

const router = Router();
const linksService = new LinksService();

router.use(authMiddleware);

// GET /api/links - List all links
router.get('/', async (req, res) => {
    try {
        const { tags, search } = req.query;
        const links = await linksService.findAll(req.user!.id, {
            tags: tags ? (tags as string).split(',') : undefined,
            search: search as string,
        });
        return successResponse(res, links);
    } catch (error) {
        console.error('Error fetching links:', error);
        return serverErrorResponse(res);
    }
});

// GET /api/links/preview - Fetch URL metadata
router.get('/preview', async (req, res) => {
    try {
        const { url } = req.query;
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }
        const metadata = await linksService.fetchMetadata(url as string);
        return successResponse(res, metadata);
    } catch (error) {
        console.error('Error fetching URL metadata:', error);
        return serverErrorResponse(res);
    }
});

// POST /api/links - Create new link
router.post('/', async (req, res) => {
    try {
        const link = await linksService.create(req.user!.id, req.body);
        return createdResponse(res, link);
    } catch (error) {
        console.error('Error creating link:', error);
        return serverErrorResponse(res);
    }
});

// GET /api/links/:id - Get single link
router.get('/:id', async (req, res) => {
    try {
        const link = await linksService.findById(req.params.id, req.user!.id);
        if (!link) {
            return notFoundResponse(res, 'Link');
        }
        return successResponse(res, link);
    } catch (error) {
        console.error('Error fetching link:', error);
        return serverErrorResponse(res);
    }
});

// PATCH /api/links/:id - Update link
router.patch('/:id', async (req, res) => {
    try {
        const link = await linksService.update(req.params.id, req.user!.id, req.body);
        if (!link) {
            return notFoundResponse(res, 'Link');
        }
        return successResponse(res, link);
    } catch (error) {
        console.error('Error updating link:', error);
        return serverErrorResponse(res);
    }
});

// DELETE /api/links/:id - Soft delete link
router.delete('/:id', async (req, res) => {
    try {
        await linksService.softDelete(req.params.id, req.user!.id);
        return successResponse(res, { deleted: true });
    } catch (error) {
        console.error('Error deleting link:', error);
        return serverErrorResponse(res);
    }
});

export default router;
