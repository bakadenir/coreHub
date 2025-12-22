import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';
import { AdminService } from '../services/admin.service';
import { successResponse, notFoundResponse, serverErrorResponse } from '../utils/response';

const router = Router();
const adminService = new AdminService();

// All admin routes require authentication + admin role
router.use(authMiddleware);
router.use(adminMiddleware);

// GET /api/admin/stats - Get dashboard statistics
router.get('/stats', async (_req, res) => {
    try {
        const stats = await adminService.getStats();
        return successResponse(res, stats);
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        return serverErrorResponse(res);
    }
});

// GET /api/admin/users - List all users
router.get('/users', async (req, res) => {
    try {
        const { page, limit, search, role, status } = req.query;
        const users = await adminService.getUsers({
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 20,
            search: search as string,
            role: role as string,
            status: status as string,
        });
        return successResponse(res, users);
    } catch (error) {
        console.error('Error fetching users:', error);
        return serverErrorResponse(res);
    }
});

// PATCH /api/admin/users/:id/role - Change user role
router.patch('/users/:id/role', async (req, res) => {
    try {
        const { role } = req.body;
        const targetUser = await adminService.updateUserRole(req.params.id, role);
        if (!targetUser) {
            return notFoundResponse(res, 'User');
        }
        // Log activity
        await adminService.logActivity(req.user!.id, `Changed role to ${role}`, {
            targetUserId: req.params.id,
            targetUserName: targetUser.name,
            newRole: role,
        });
        return successResponse(res, targetUser);
    } catch (error) {
        console.error('Error updating user role:', error);
        return serverErrorResponse(res);
    }
});

// PATCH /api/admin/users/:id/status - Ban/unban user
router.patch('/users/:id/status', async (req, res) => {
    try {
        const { banned } = req.body;
        const targetUser = await adminService.setUserBanned(req.params.id, banned);
        if (!targetUser) {
            return notFoundResponse(res, 'User');
        }
        // Log activity
        const action = banned ? 'Banned user' : 'Unbanned user';
        await adminService.logActivity(req.user!.id, action, {
            targetUserId: req.params.id,
            targetUserName: targetUser.name,
        });
        return successResponse(res, targetUser);
    } catch (error) {
        console.error('Error updating user status:', error);
        return serverErrorResponse(res);
    }
});

// GET /api/admin/activity-logs - Get activity logs
router.get('/activity-logs', async (req, res) => {
    try {
        const { page, limit } = req.query;
        const logs = await adminService.getActivityLogs({
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 50,
        });
        return successResponse(res, logs);
    } catch (error) {
        console.error('Error fetching activity logs:', error);
        return serverErrorResponse(res);
    }
});

// GET /api/admin/reports - Get content reports
router.get('/reports', async (req, res) => {
    try {
        const { status } = req.query;
        const reports = await adminService.getReports(status as string);
        return successResponse(res, reports);
    } catch (error) {
        console.error('Error fetching reports:', error);
        return serverErrorResponse(res);
    }
});

// PATCH /api/admin/reports/:id - Review report
router.patch('/reports/:id', async (req, res) => {
    try {
        const { status } = req.body;
        const report = await adminService.reviewReport(req.params.id, req.user!.id, status);
        if (!report) {
            return notFoundResponse(res, 'Report');
        }
        return successResponse(res, report);
    } catch (error) {
        console.error('Error reviewing report:', error);
        return serverErrorResponse(res);
    }
});

// GET /api/admin/users/:id - Get user details
router.get('/users/:id', async (req, res) => {
    try {
        const user = await adminService.getUserById(req.params.id);
        if (!user) {
            return notFoundResponse(res, 'User');
        }
        return successResponse(res, user);
    } catch (error) {
        console.error('Error fetching user:', error);
        return serverErrorResponse(res);
    }
});

// DELETE /api/admin/users/:id - Delete user permanently
router.delete('/users/:id', async (req, res) => {
    try {
        // Get user info before deleting for logging
        const userToDelete = await adminService.getUserById(req.params.id);
        const result = await adminService.deleteUser(req.params.id);
        if (!result) {
            return notFoundResponse(res, 'User');
        }
        // Log activity
        await adminService.logActivity(req.user!.id, 'Deleted user', {
            deletedUserId: req.params.id,
            deletedUserName: userToDelete?.name || 'Unknown',
            deletedUserEmail: userToDelete?.email || 'Unknown',
        });
        return successResponse(res, { message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        return serverErrorResponse(res);
    }
});

export default router;

