import { Router, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import * as notificationsService from '../services/notifications.service';

const router = Router();

// Store active SSE connections
const clients: Map<string, Response[]> = new Map();

// SSE endpoint for real-time notifications
router.get('/notifications', authMiddleware, (req, res) => {
    const userId = req.user!.id;

    // Set headers for SSE with proper CORS
    const origin = req.headers.origin || '*';
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.flushHeaders();

    // Add client to connected clients
    if (!clients.has(userId)) {
        clients.set(userId, []);
    }
    clients.get(userId)!.push(res);

    // Send initial unread count
    notificationsService.getUnreadCount(userId).then(count => {
        res.write(`data: ${JSON.stringify({ type: 'unread_count', count })}\n\n`);
    });

    // Keep connection alive
    const keepAlive = setInterval(() => {
        res.write(':keepalive\n\n');
    }, 30000);

    // Clean up on disconnect
    req.on('close', () => {
        clearInterval(keepAlive);
        const userClients = clients.get(userId);
        if (userClients) {
            const index = userClients.indexOf(res);
            if (index > -1) {
                userClients.splice(index, 1);
            }
            if (userClients.length === 0) {
                clients.delete(userId);
            }
        }
    });
});

// Helper function to broadcast to a user (exported for use in other services)
export function broadcastToUser(userId: string, data: unknown) {
    const userClients = clients.get(userId);
    if (userClients) {
        const message = `data: ${JSON.stringify(data)}\n\n`;
        userClients.forEach(client => {
            try {
                client.write(message);
            } catch (e) {
                console.error('Error sending SSE message:', e);
            }
        });
    }
}

export default router;
