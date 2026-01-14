import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import * as notificationsService from '../services/notifications.service';

const router = Router();

// Get notification settings
router.get('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.user!.id;
        const settings = await notificationsService.getNotificationSettings(userId);
        res.json({ success: true, data: settings });
    } catch (error) {
        console.error('Error getting notification settings:', error);
        res.status(500).json({ success: false, error: 'Failed to get settings' });
    }
});

// Update notification settings
router.patch('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.user!.id;
        const { habitReminders, scheduleReminders, scheduleReminderMinutes, todoReminders, pushEnabled } = req.body;

        const updates: Record<string, unknown> = {};
        if (typeof habitReminders === 'boolean') updates.habitReminders = habitReminders;
        if (typeof scheduleReminders === 'boolean') updates.scheduleReminders = scheduleReminders;
        if (typeof scheduleReminderMinutes === 'number') updates.scheduleReminderMinutes = scheduleReminderMinutes;
        if (typeof todoReminders === 'boolean') updates.todoReminders = todoReminders;
        if (typeof pushEnabled === 'boolean') updates.pushEnabled = pushEnabled;

        const settings = await notificationsService.updateNotificationSettings(userId, updates as Parameters<typeof notificationsService.updateNotificationSettings>[1]);
        res.json({ success: true, data: settings });
    } catch (error) {
        console.error('Error updating notification settings:', error);
        res.status(500).json({ success: false, error: 'Failed to update settings' });
    }
});

export default router;
