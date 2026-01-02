import * as Sentry from '@sentry/node';
import { env } from './env';

export function initSentry() {
    // Only initialize Sentry in production with DSN configured
    const dsn = process.env.SENTRY_DSN;

    if (dsn && env.NODE_ENV === 'production') {
        Sentry.init({
            dsn,
            environment: env.NODE_ENV,
            tracesSampleRate: 0.1, // 10% of transactions for performance monitoring
            integrations: [
                Sentry.httpIntegration(),
                Sentry.expressIntegration(),
            ],
        });
        console.log('🔔 Sentry error tracking initialized');
    } else {
        console.log('⚠️  Sentry not initialized (missing DSN or not in production)');
    }
}

export { Sentry };
