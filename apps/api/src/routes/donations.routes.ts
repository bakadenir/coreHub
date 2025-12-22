import { Router } from 'express';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.middleware';
import { DonationsService } from '../services/donations.service';
import { successResponse, createdResponse, errorResponse, serverErrorResponse } from '../utils/response';

const router = Router();
const donationsService = new DonationsService();

// POST /api/donations - Create donation and get Midtrans Snap token
router.post('/', optionalAuthMiddleware, async (req, res) => {
    try {
        const { amount, name, email, message } = req.body;

        if (!amount || amount < 1000) {
            return errorResponse(res, 'Bad Request', 'Minimum donation is Rp 1.000');
        }

        if (!name || name.trim().length < 2) {
            return errorResponse(res, 'Bad Request', 'Name is required');
        }

        const result = await donationsService.create({
            amount: Math.round(amount),
            name: name.trim(),
            email: email?.trim() || undefined,
            message: message?.trim() || undefined,
            userId: req.user?.id,
        });

        return createdResponse(res, result);
    } catch (error) {
        console.error('Error creating donation:', error);
        return serverErrorResponse(res);
    }
});

// POST /api/donations/webhook - Midtrans notification handler
router.post('/webhook', async (req, res) => {
    try {
        console.log('Midtrans webhook received:', req.body);

        const result = await donationsService.handleWebhook(req.body);

        console.log('Donation updated:', result);

        // Midtrans expects 200 OK response
        return res.status(200).json({ status: 'ok' });
    } catch (error) {
        console.error('Error handling Midtrans webhook:', error);
        // Still return 200 to prevent Midtrans from retrying
        return res.status(200).json({ status: 'error', error: 'Internal error' });
    }
});

// GET /api/donations - List successful donations (public)
router.get('/', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit as string) || 20;
        const donations = await donationsService.findAllPublic(limit);
        return successResponse(res, donations);
    } catch (error) {
        console.error('Error fetching donations:', error);
        return serverErrorResponse(res);
    }
});

// GET /api/donations/my - Get user's donation history
router.get('/my', authMiddleware, async (req, res) => {
    try {
        const donations = await donationsService.findByUser(req.user!.id);
        return successResponse(res, donations);
    } catch (error) {
        console.error('Error fetching user donations:', error);
        return serverErrorResponse(res);
    }
});

// GET /api/donations/:orderId - Get donation by order ID
router.get('/:orderId', async (req, res) => {
    try {
        const donation = await donationsService.findByOrderId(req.params.orderId);
        if (!donation) {
            return errorResponse(res, 'Not Found', 'Donation not found');
        }
        return successResponse(res, donation);
    } catch (error) {
        console.error('Error fetching donation:', error);
        return serverErrorResponse(res);
    }
});

export default router;
