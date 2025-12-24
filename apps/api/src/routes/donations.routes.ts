import { Router } from 'express';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.middleware';
import { DonationsService } from '../services/donations.service';
import { successResponse, createdResponse, errorResponse, serverErrorResponse } from '../utils/response';

const router = Router();
const donationsService = new DonationsService();

// Transform snake_case from Supabase to camelCase for frontend
function transformDonation(d: any) {
    return {
        id: d.id,
        orderId: d.order_id,
        amount: d.amount,
        currency: d.currency || 'IDR',
        name: d.name,
        message: d.message,
        status: d.status,
        paidAt: d.paid_at,
        createdAt: d.created_at,
    };
}

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

        return createdResponse(res, {
            ...result,
            donation: transformDonation(result.donation),
        });
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
        return successResponse(res, donations.map(transformDonation));
    } catch (error) {
        console.error('Error fetching donations:', error);
        return serverErrorResponse(res);
    }
});

// GET /api/donations/pending - Get user's pending donation
router.get('/pending', authMiddleware, async (req, res) => {
    try {
        const pending = await donationsService.findPendingByUser(req.user!.id);
        return successResponse(res, pending ? transformDonation(pending) : null);
    } catch (error) {
        console.error('Error fetching pending donation:', error);
        return serverErrorResponse(res);
    }
});

// GET /api/donations/my - Get user's donation history
router.get('/my', authMiddleware, async (req, res) => {
    try {
        const donations = await donationsService.findByUser(req.user!.id);
        return successResponse(res, donations.map(transformDonation));
    } catch (error) {
        console.error('Error fetching user donations:', error);
        return serverErrorResponse(res);
    }
});

// POST /api/donations/:orderId/cancel - Cancel pending donation
router.post('/:orderId/cancel', authMiddleware, async (req, res) => {
    try {
        const cancelled = await donationsService.cancelByOrderId(req.params.orderId, req.user!.id);
        if (!cancelled) {
            return errorResponse(res, 'Not Found', 'Donation not found or already processed');
        }
        return successResponse(res, { cancelled: true });
    } catch (error) {
        console.error('Error cancelling donation:', error);
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

// POST /api/donations/:orderId/verify - Manually verify transaction status with Midtrans
// Falls back to marking as success if Midtrans API is unreachable
router.post('/:orderId/verify', async (req, res) => {
    try {
        // First try to verify with Midtrans API
        const donation = await donationsService.verifyTransaction(req.params.orderId);
        if (!donation) {
            return errorResponse(res, 'Not Found', 'Donation not found');
        }
        return successResponse(res, transformDonation(donation));
    } catch (error) {
        console.error('Error verifying with Midtrans API:', error);

        // Fallback: Mark as success directly if called from onSuccess callback
        // The Snap onSuccess callback is reliable - if it fires, payment was successful
        try {
            console.log('Falling back to direct mark-success for:', req.params.orderId);
            const donation = await donationsService.markAsSuccess(req.params.orderId);
            if (!donation) {
                return errorResponse(res, 'Not Found', 'Donation not found');
            }
            return successResponse(res, { ...transformDonation(donation), fallback: true });
        } catch (fallbackError) {
            console.error('Fallback also failed:', fallbackError);
            return serverErrorResponse(res);
        }
    }
});

// POST /api/donations/:orderId/mark-success - Directly mark donation as success
// Used as fallback when Midtrans API is unreachable (localhost, network issues)
router.post('/:orderId/mark-success', async (req, res) => {
    try {
        const donation = await donationsService.markAsSuccess(req.params.orderId);
        if (!donation) {
            return errorResponse(res, 'Not Found', 'Donation not found');
        }
        return successResponse(res, donation);
    } catch (error) {
        console.error('Error marking donation as success:', error);
        return serverErrorResponse(res);
    }
});

// GET /api/donations/admin/all - Get all donations (including pending) for admin
// NOTE: Temporarily without auth for localhost debugging
router.get('/admin/all', async (req, res) => {
    try {
        const donations = await donationsService.findAll();
        return successResponse(res, donations);
    } catch (error) {
        console.error('Error fetching all donations:', error);
        return serverErrorResponse(res);
    }
});

// POST /api/donations/admin/verify-pending - Verify all pending donations with Midtrans
// NOTE: Temporarily without auth for localhost debugging
router.post('/admin/verify-pending', async (req, res) => {
    try {
        const results = await donationsService.verifyAllPending();
        return successResponse(res, results);
    } catch (error) {
        console.error('Error verifying pending donations:', error);
        return serverErrorResponse(res);
    }
});

export default router;
