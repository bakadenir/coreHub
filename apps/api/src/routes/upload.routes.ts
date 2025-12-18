import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { successResponse, errorResponse, serverErrorResponse } from '../utils/response';
import { db } from '../config/database';
import { user } from '../db/schema';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

const router = Router();

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'avatars');
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// POST /api/upload/avatar - Upload avatar as file
router.post('/avatar', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { image } = req.body;  // base64 image from frontend

        if (!image) {
            return errorResponse(res, 'Bad Request', 'No image provided');
        }

        // Validate base64 image
        const matches = image.match(/^data:image\/(png|jpeg|jpg|gif|webp);base64,(.+)$/);
        if (!matches) {
            return errorResponse(res, 'Bad Request', 'Invalid image format');
        }

        const extension = matches[1] === 'jpeg' ? 'jpg' : matches[1];
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, 'base64');

        // Check file size (max 500KB for avatar)
        if (buffer.length > 500 * 1024) {
            return errorResponse(res, 'Bad Request', 'Image too large. Max 500KB allowed.');
        }

        // Generate unique filename
        const filename = `${req.user!.id}_${Date.now()}.${extension}`;
        const filepath = path.join(UPLOADS_DIR, filename);

        // Delete old avatar if exists
        const existingUser = await db.query.user.findFirst({
            where: eq(user.id, req.user!.id),
        });

        if (existingUser?.image?.startsWith('/uploads/avatars/')) {
            const oldFilename = existingUser.image.replace('/uploads/avatars/', '');
            const oldFilepath = path.join(UPLOADS_DIR, oldFilename);
            if (fs.existsSync(oldFilepath)) {
                fs.unlinkSync(oldFilepath);
            }
        }

        // Save file
        fs.writeFileSync(filepath, buffer);

        // Update database with URL (not base64)
        const avatarUrl = `/uploads/avatars/${filename}`;
        await db.update(user)
            .set({ image: avatarUrl, updatedAt: new Date() })
            .where(eq(user.id, req.user!.id));

        return successResponse(res, { avatarUrl });
    } catch (error) {
        console.error('Error uploading avatar:', error);
        return serverErrorResponse(res);
    }
});

export default router;
