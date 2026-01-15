import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import * as notificationsService from '../services/notifications.service';

const router = Router();

// Transform snake_case to camelCase for frontend
function transformNotification(n: any) {
    return {
        id: n.id,
        userId: n.user_id,
        type: n.type,
        title: n.title,
        message: n.message,
        referenceId: n.reference_id,
        referenceType: n.reference_type,
        isRead: n.is_read,
        createdAt: n.created_at,
    };
}

// Get user notifications
router.get('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.user!.id;
        const limit = parseInt(req.query.limit as string) || 20;
        const unreadOnly = req.query.unreadOnly === 'true';

        const notifications = await notificationsService.getNotifications(userId, limit, unreadOnly);
        const transformed = notifications.map(transformNotification);
        res.json({ success: true, data: transformed });
    } catch (error) {
        console.error('Error getting notifications:', error);
        res.status(500).json({ success: false, error: 'Failed to get notifications' });
    }
});

// Get unread count
router.get('/unread-count', authMiddleware, async (req, res) => {
    try {
        const userId = req.user!.id;
        const count = await notificationsService.getUnreadCount(userId);
        res.json({ success: true, data: { count } });
    } catch (error) {
        console.error('Error getting unread count:', error);
        res.status(500).json({ success: false, error: 'Failed to get unread count' });
    }
});

// Mark notification as read
router.patch('/:id/read', authMiddleware, async (req, res) => {
    try {
        const userId = req.user!.id;
        const notificationId = req.params.id;

        const updated = await notificationsService.markAsRead(notificationId, userId);
        if (!updated) {
            return res.status(404).json({ success: false, error: 'Notification not found' });
        }
        res.json({ success: true, data: updated });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ success: false, error: 'Failed to mark as read' });
    }
});

// Mark all as read
router.post('/mark-all-read', authMiddleware, async (req, res) => {
    try {
        const userId = req.user!.id;
        await notificationsService.markAllAsRead(userId);
        res.json({ success: true });
    } catch (error) {
        console.error('Error marking all as read:', error);
        res.status(500).json({ success: false, error: 'Failed to mark all as read' });
    }
});

// Delete notification
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const userId = req.user!.id;
        const notificationId = req.params.id;

        const deleted = await notificationsService.deleteNotification(notificationId, userId);
        if (!deleted) {
            return res.status(404).json({ success: false, error: 'Notification not found' });
        }
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ success: false, error: 'Failed to delete notification' });
    }
});

// Trigger admin notification (internal use or protected)
router.post('/trigger-admin', authMiddleware, async (req, res) => {
    try {
        const { title, message, type, referenceId, referenceType } = req.body;

        // Optional: Add logic to verify if the caller is allowed to trigger this
        // For now, any authenticated user (e.g. upon self-registration) can trigger "New User" alert

        await notificationsService.notifyAdmins(
            title,
            message,
            type || 'system',
            referenceId,
            referenceType
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Error triggering admin notification:', error);
        res.status(500).json({ success: false, error: 'Failed to trigger notification' });
    }
});

export default router;
