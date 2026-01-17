// Email service using Resend for sending OTP verification emails
import { Resend } from 'resend';
import { env } from '../config/env';

// Initialize Resend client (will be null if no API key configured)
const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

/**
 * Send OTP verification email
 */
export async function sendOTPEmail(email: string, code: string): Promise<{ success: boolean; error?: string }> {
    if (!resend) {
        console.warn('⚠️ RESEND_API_KEY not configured. OTP email not sent.');
        console.log(`📧 [DEV MODE] OTP for ${email}: ${code}`);
        return { success: true }; // Allow dev mode without email
    }

    try {
        const { error } = await resend.emails.send({
            from: env.EMAIL_FROM,
            to: email,
            subject: 'Verify your coreHub account',
            html: getOTPEmailTemplate(code),
        });

        if (error) {
            console.error('Failed to send email:', error);
            return { success: false, error: error.message };
        }

        console.log(`📧 OTP email sent to ${email}`);
        return { success: true };
    } catch (err) {
        console.error('Email send error:', err);
        return { success: false, error: 'Failed to send email' };
    }
}

/**
 * Beautiful HTML email template for OTP
 */
function getOTPEmailTemplate(code: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify your email</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="100%" style="max-width: 480px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                    <!-- Header -->
                    <tr>
                        <td style="background-color: #18181b; padding: 32px 40px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">
                                coreHub
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 16px; color: #18181b; font-size: 20px; font-weight: 600;">
                                Verify your email address
                            </h2>
                            <p style="margin: 0 0 24px; color: #52525b; font-size: 15px; line-height: 1.6;">
                                Enter the following verification code to complete your registration. This code will expire in 10 minutes.
                            </p>
                            
                            <!-- OTP Code -->
                            <div style="background-color: #f4f4f5; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px;">
                                <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #18181b; font-family: 'Courier New', monospace;">
                                    ${code}
                                </span>
                            </div>
                            
                            <p style="margin: 0; color: #71717a; font-size: 13px; line-height: 1.5;">
                                If you didn't request this code, you can safely ignore this email. Someone might have typed your email address by mistake.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px 40px; background-color: #fafafa; border-top: 1px solid #e4e4e7;">
                            <p style="margin: 0; color: #a1a1aa; font-size: 12px; text-align: center;">
                                © ${new Date().getFullYear()} coreHub. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `.trim();
}
