// Authentication routes for OTP email verification
import { Router } from 'express';
import { generateOTP, verifyOTP, isEmailVerified } from '../services/otp.service';
import { z } from 'zod';
import { supabase } from '../config/supabase';

const router = Router();

// Validation schemas
const emailSchema = z.object({
    email: z.string().email('Invalid email address'),
});

const verifySchema = z.object({
    email: z.string().email('Invalid email address'),
    code: z.string().length(6, 'Code must be 6 digits'),
});

const validateSchema = z.object({
    email: z.string().email('Invalid email address'),
    code: z.string().length(6, 'Code must be 6 digits'),
});

const resetPasswordSchema = z.object({
    email: z.string().email('Invalid email address'),
    code: z.string().length(6, 'Code must be 6 digits'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

/**
 * @swagger
 * /api/auth/send-otp:
 *   post:
 *     summary: Send OTP verification code to email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Invalid email
 *       500:
 *         description: Failed to send OTP
 */
router.post('/send-otp', async (req, res) => {
    try {
        const { email } = emailSchema.parse(req.body);

        const result = await generateOTP(email);

        if (!result.success) {
            // Use 429 status for rate limiting
            const status = result.retryAfter ? 429 : 500;
            return res.status(status).json({
                error: result.error,
                retryAfter: result.retryAfter
            });
        }

        res.json({ message: 'Verification code sent to your email' });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ error: err.errors[0].message });
        }
        console.error('Send OTP error:', err);
        res.status(500).json({ error: 'Failed to send verification code' });
    }
});

/**
 * @swagger
 * /api/auth/validate-otp:
 *   post:
 *     summary: Check if OTP code is valid without consuming it
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, code]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               code:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 6
 *     responses:
 *       200:
 *         description: Code is valid
 *       400:
 *         description: Invalid or expired code
 */
router.post('/validate-otp', async (req, res) => {
    try {
        const { email, code } = validateSchema.parse(req.body);

        // Verify with consume=false
        const result = await verifyOTP(email, code, false);

        if (!result.success) {
            return res.status(400).json({ error: result.error });
        }

        res.json({ message: 'Code is valid' });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ error: err.errors[0].message });
        }
        console.error('Validate OTP error:', err);
        res.status(500).json({ error: 'Failed to validate code' });
    }
});

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify OTP code (and consume it)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, code]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               code:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 6
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired code
 */
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, code } = verifySchema.parse(req.body);

        const result = await verifyOTP(email, code);

        if (!result.success) {
            return res.status(400).json({ error: result.error });
        }

        res.json({ message: 'Email verified successfully' });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ error: err.errors[0].message });
        }
        console.error('Verify OTP error:', err);
        res.status(500).json({ error: 'Failed to verify code' });
    }
});

/**
 * @swagger
 * /api/auth/check-verified:
 *   get:
 *     summary: Check if email is verified
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *     responses:
 *       200:
 *         description: Verification status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 verified:
 *                   type: boolean
 */
router.get('/check-verified', async (req, res) => {
    try {
        const email = req.query.email as string;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const verified = await isEmailVerified(email);
        res.json({ verified });
    } catch (err) {
        console.error('Check verified error:', err);
        res.status(500).json({ error: 'Failed to check verification status' });
    }
});

/**
 * @swagger
 * /api/auth/forget-password:
 *   post:
 *     summary: Send password reset OTP code to email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Invalid email or user not found
 *       429:
 *         description: Rate limited
 */
router.post('/forget-password', async (req, res) => {
    try {
        const { email } = emailSchema.parse(req.body);

        // Check if user exists via Supabase Auth Admin API
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

        if (listError) {
            console.error('Failed to list users:', listError);
            return res.status(500).json({ error: 'Database error checking user' });
        }

        const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase());

        if (!user) {
            // User not found
            return res.status(400).json({ error: 'Email is not registered' });
        }

        // User exists - send OTP
        const result = await generateOTP(email);

        if (!result.success) {
            const status = result.retryAfter ? 429 : 500;
            return res.status(status).json({
                error: result.error,
                retryAfter: result.retryAfter
            });
        }

        res.json({ message: 'Password reset code sent to your email' });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ error: err.errors[0].message });
        }
        console.error('Forget password error:', err);
        res.status(500).json({
            error: 'Failed to send reset code',
            details: err instanceof Error ? err.message : 'Unknown error'
        });
    }
});

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password using OTP code
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, code, newPassword]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               code:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 6
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid or expired code
 */
router.post('/reset-password', async (req, res) => {
    try {
        const { email, code, newPassword } = resetPasswordSchema.parse(req.body);

        // First verify the OTP
        const verifyResult = await verifyOTP(email, code);

        if (!verifyResult.success) {
            return res.status(400).json({ error: verifyResult.error });
        }

        // OTP verified - now update password via Supabase Admin
        // We use the top-level imported supabase client which uses service role

        // Get user by email
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) {
            console.error('Failed to list users:', listError);
            return res.status(500).json({ error: 'Failed to reset password' });
        }

        const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase());
        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }

        // Update password
        const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
            password: newPassword,
        });

        if (updateError) {
            console.error('Failed to update password:', updateError);
            return res.status(500).json({ error: 'Failed to update password' });
        }

        console.log('✅ Password reset for user:', user.email);
        res.json({ message: 'Password reset successfully' });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ error: err.errors[0].message });
        }
        console.error('Reset password error:', err);
        res.status(500).json({ error: 'Failed to reset password' });
    }
});

export default router;
