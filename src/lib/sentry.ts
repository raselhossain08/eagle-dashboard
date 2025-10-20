import * as Sentry from '@sentry/nextjs'

export function initSentry() {
  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 0.1,
      integrations: [
        new Sentry.BrowserTracing({
          tracePropagationTargets: ['localhost', /^https:\/\/yourapp\.com/],
        }),
      ],
      beforeSend(event) {
        // Filter out Prisma instrumentation warnings
        if (event.exception?.values?.[0]?.value?.includes('@prisma/instrumentation')) {
          return null;
        }
        return event;
      },
    })
  }
}

export { Sentry }