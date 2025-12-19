import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import * as notificationsService from '../services/notifications.service';
import { getVapidPublicKey, isPushConfigured } from '../services/push.service';

const router = Router();

// Get VAPID public key
router.get('/vapid-public-key', (_req, res) => {
    if (!isPushConfigured()) {
        return res.status(503).json({
            success: false,
            error: 'Push notifications not configured'
        });
    }
    res.json({ success: true, data: { publicKey: getVapidPublicKey() } });
});

// Subscribe to push notifications
router.post('/subscribe', authMiddleware, async (req, res) => {
    try {
        const userId = req.user!.id;
        const { endpoint, keys, userAgent } = req.body;

        if (!endpoint || !keys?.p256dh || !keys?.auth) {
            return res.status(400).json({
                success: false,
                error: 'Invalid subscription data'
            });
        }

        const subscription = await notificationsService.savePushSubscription(
            userId,
            endpoint,
            keys.p256dh,
            keys.auth,
            userAgent
        );

        // Also enable push in settings
        await notificationsService.updateNotificationSettings(userId, {
            pushEnabled: true,
        });

        res.json({ success: true, data: subscription });
    } catch (error) {
        console.error('Error saving subscription:', error);
        res.status(500).json({ success: false, error: 'Failed to save subscription' });
    }
});

// Unsubscribe from push notifications (using POST since body is needed)
router.post('/unsubscribe', authMiddleware, async (req, res) => {
    try {
        const userId = req.user!.id;
        const { endpoint } = req.body;

        if (!endpoint) {
            return res.status(400).json({
                success: false,
                error: 'Endpoint required'
            });
        }

        await notificationsService.removePushSubscription(userId, endpoint);
        res.json({ success: true });
    } catch (error) {
        console.error('Error removing subscription:', error);
        res.status(500).json({ success: false, error: 'Failed to remove subscription' });
    }
});

export default router;
