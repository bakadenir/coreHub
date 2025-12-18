import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './database';
import { env } from './env';

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: 'pg',
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false, // Set to true in production
        // Password reset functionality
        sendResetPassword: async ({ user, url }) => {
            // In development, log to console
            // In production, integrate with email service (Resend, SendGrid, etc.)
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('📧 PASSWORD RESET REQUEST');
            console.log(`   User: ${user.email}`);
            console.log(`   Reset URL: ${url}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        },
    },
    user: {
        additionalFields: {
            role: {
                type: 'string',
                required: false,
                defaultValue: 'user',
                input: false, // Don't allow users to set their own role
            },
            // Note: bio, image, and username are stored in DB but NOT included in session
            // They are fetched separately via /api/users/me to avoid large session cookies
        },
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // Update session every 1 day
        cookieCache: {
            enabled: true,
            maxAge: 60 * 5, // 5 minutes
        },
    },
    trustedOrigins: [env.FRONTEND_URL],
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
});
