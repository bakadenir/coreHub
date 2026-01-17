// OTP service for generating and verifying email verification codes
import { supabase } from '../config/supabase';
import { sendOTPEmail } from './email.service';

const OTP_EXPIRY_MINUTES = 10;
const OTP_COOLDOWN_SECONDS = 60; // Rate limit: 1 OTP per 60 seconds

/**
 * Generate a 6-digit OTP code
 */
function generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generate and send OTP to email
 */
export async function generateOTP(email: string): Promise<{ success: boolean; error?: string; retryAfter?: number }> {
    try {
        const normalizedEmail = email.toLowerCase();

        // Check for rate limiting - find recent OTP for this email
        const { data: existingOtp } = await supabase
            .from('otp_codes')
            .select('created_at')
            .eq('email', normalizedEmail)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (existingOtp) {
            const createdAt = new Date(existingOtp.created_at).getTime();
            const now = Date.now();
            const secondsSinceLastOtp = Math.floor((now - createdAt) / 1000);

            if (secondsSinceLastOtp < OTP_COOLDOWN_SECONDS) {
                const retryAfter = OTP_COOLDOWN_SECONDS - secondsSinceLastOtp;
                console.log(`Rate limit hit for ${normalizedEmail}. Retry after ${retryAfter}s`);
                return {
                    success: false,
                    error: `Please wait ${retryAfter} seconds before requesting a new code`,
                    retryAfter
                };
            }
        }

        // Delete any existing OTP codes for this email (passed rate limit check)
        await supabase
            .from('otp_codes')
            .delete()
            .eq('email', normalizedEmail);

        // Generate new code
        const code = generateCode();
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

        // Save to database
        const { error: dbError } = await supabase
            .from('otp_codes')
            .insert({
                email: normalizedEmail,
                code,
                expires_at: expiresAt.toISOString(),
                verified: false,
            });

        if (dbError) {
            console.error('Failed to save OTP:', dbError);
            return { success: false, error: 'Failed to generate verification code' };
        }

        // Send email
        const emailResult = await sendOTPEmail(email, code);
        if (!emailResult.success) {
            return { success: false, error: emailResult.error || 'Failed to send email' };
        }

        return { success: true };
    } catch (err) {
        console.error('OTP generation error:', err);
        return { success: false, error: 'Failed to generate verification code' };
    }
}

/**
 * Verify OTP code
 * @param consume If true, marks as verified and deletes the code (default: true). If false, just checks validity.
 */
export async function verifyOTP(email: string, code: string, consume: boolean = true): Promise<{ success: boolean; error?: string }> {
    try {
        const normalizedEmail = email.toLowerCase();

        // Find valid OTP
        const { data: otpRecord, error: fetchError } = await supabase
            .from('otp_codes')
            .select('*')
            .eq('email', normalizedEmail)
            .eq('code', code)
            .eq('verified', false)
            .gt('expires_at', new Date().toISOString())
            .single();

        if (fetchError || !otpRecord) {
            // If not found, check if it might be already verified (if we are consuming, this is invalid, but if we are just checking... wait. 
            // actually if it's strictly 2-step, step 1 check shouldn't have been verified yet).
            console.error('OTP fetch error:', fetchError);
            return { success: false, error: 'Invalid or expired verification code' };
        }

        // If we are just checking (not consuming), return success here
        if (!consume) {
            return { success: true };
        }

        // Mark OTP as verified
        await supabase
            .from('otp_codes')
            .update({ verified: true })
            .eq('id', otpRecord.id);

        // Get user ID first, then upsert profiles (create if not exists)
        const userId = await getUserIdByEmail(normalizedEmail);
        console.log('Verifying email for user:', userId, normalizedEmail);

        if (userId) {
            // Use upsert to create profile if it doesn't exist
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert(
                    { id: userId, email_verified: true },
                    { onConflict: 'id' }
                );

            if (profileError) {
                console.error('Failed to upsert profile:', profileError);
            } else {
                console.log('✅ Email verified for user:', userId);
            }
        } else {
            console.error('Could not find user ID for email:', normalizedEmail);
        }

        // Clean up old OTP codes for this email
        await supabase
            .from('otp_codes')
            .delete()
            .eq('email', normalizedEmail);

        return { success: true };
    } catch (err) {
        console.error('OTP verification error:', err);
        return { success: false, error: 'Failed to verify code' };
    }
}

/**
 * Check if email is verified
 */
export async function isEmailVerified(email: string): Promise<boolean> {
    try {
        const normalizedEmail = email.toLowerCase();
        const userId = await getUserIdByEmail(normalizedEmail);
        console.log('isEmailVerified - checking:', normalizedEmail, 'userId:', userId);

        if (!userId) {
            console.log('isEmailVerified - no userId found, returning false');
            return false;
        }

        const { data, error } = await supabase
            .from('profiles')
            .select('email_verified')
            .eq('id', userId)
            .single();

        console.log('isEmailVerified - profile data:', data, 'error:', error);

        const isVerified = data?.email_verified === true;
        console.log('isEmailVerified - result:', isVerified);
        return isVerified;
    } catch (err) {
        console.error('isEmailVerified - exception:', err);
        return false;
    }
}

/**
 * Get user ID by email from Supabase Auth
 */
async function getUserIdByEmail(email: string): Promise<string | null> {
    try {
        // Use admin API to find user by email
        const { data: { users }, error } = await supabase.auth.admin.listUsers();

        if (error) {
            console.error('Failed to list users:', error);
            return null;
        }

        const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase());
        return user?.id ?? null;
    } catch (err) {
        console.error('Failed to get user by email:', err);
        return null;
    }
}
