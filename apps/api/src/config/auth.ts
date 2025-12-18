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
    },
    user: {
        additionalFields: {
            role: {
                type: 'string',
                required: false,
                defaultValue: 'user',
                input: false, // Don't allow users to set their own role
            },
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
