import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { successResponse, errorResponse, serverErrorResponse } from '../utils/response';
import { supabase } from '../config/supabase';
import sharp from 'sharp';

const router = Router();

const BUCKET_NAME = 'avatars';
const AVATAR_SIZE = 200; // 200x200 pixels

// POST /api/upload/avatar - Upload avatar to Supabase Storage
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

        const base64Data = matches[2];
        const inputBuffer = Buffer.from(base64Data, 'base64');

        // Check input file size (max 5MB before processing)
        if (inputBuffer.length > 5 * 1024 * 1024) {
            return errorResponse(res, 'Bad Request', 'Image too large. Max 5MB allowed.');
        }

        // Process image with Sharp: resize, crop to square, convert to WebP
        const processedBuffer = await sharp(inputBuffer)
            .resize(AVATAR_SIZE, AVATAR_SIZE, {
                fit: 'cover',      // Crop to fill the square
                position: 'center' // Center the crop
            })
            .webp({ quality: 80 }) // Convert to WebP with good quality
            .toBuffer();

        // Generate unique filename (always .webp now)
        const filename = `${req.user!.id}_${Date.now()}.webp`;

        // Get current user to find old avatar URL
        const { data: userData } = await supabase.auth.admin.getUserById(req.user!.id);
        const oldAvatarUrl = userData?.user?.user_metadata?.image;

        // Delete old avatar from Supabase Storage if it exists
        if (oldAvatarUrl && oldAvatarUrl.includes(BUCKET_NAME)) {
            const urlParts = oldAvatarUrl.split('/');
            const oldFilename = urlParts[urlParts.length - 1];
            if (oldFilename) {
                await supabase.storage.from(BUCKET_NAME).remove([oldFilename]);
            }
        }

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(filename, processedBuffer, {
                contentType: 'image/webp',
                upsert: true,
            });

        if (uploadError) {
            console.error('Supabase Storage upload error:', uploadError);
            return errorResponse(res, 'Upload Failed', uploadError.message);
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(filename);

        const avatarUrl = publicUrlData.publicUrl;

        // Update user metadata with avatar URL
        await supabase.auth.admin.updateUserById(req.user!.id, {
            user_metadata: { image: avatarUrl },
        });

        return successResponse(res, { avatarUrl });
    } catch (error) {
        console.error('Error uploading avatar:', error);
        return serverErrorResponse(res);
    }
});

export default router;
