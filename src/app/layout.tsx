import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SessionProvider } from '@/components/providers/session-provider'
import { ReactQueryProvider } from '@/components/providers/react-query-provider'
import { ErrorBoundary } from '@/components/error-boundary'
import { HealthCheck } from '@/components/health-check'
import { validateEnvironment } from '@/lib/env'
import { initSentry } from '@/lib/sentry'
import { ThemeProvider } from '@/providers/theme-provider'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

// Validate environment on server start
if (typeof window === 'undefined') {
  validateEnvironment()
  initSentry()
}

export const metadata: Metadata = {
  title: {
    default: 'Eagle Analytics - Professional Analytics Dashboard',
    template: '%s | Eagle Analytics'
  },
  description: 'Advanced analytics platform for tracking user behavior and business metrics',
  keywords: ['analytics', 'dashboard', 'metrics', 'business intelligence', 'data visualization'],
  authors: [{ name: 'Eagle Analytics Team' }],
  creator: 'Eagle Analytics',
  publisher: 'Eagle Analytics',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://yourapp.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://yourapp.com',
    title: 'Eagle Analytics - Professional Analytics Dashboard',
    description: 'Advanced analytics platform for tracking user behavior and business metrics',
    siteName: 'Eagle Analytics',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Eagle Analytics - Professional Analytics Dashboard',
    description: 'Advanced analytics platform for tracking user behavior and business metrics',
    creator: '@eagleanalytics',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Performance monitoring
              (function() {
                var start = performance.now();
                window.addEventListener('load', function() {
                  var loadTime = performance.now() - start;
                  if (window.gtag) {
                    gtag('event', 'timing_complete', {
                      name: 'page_load',
                      value: Math.round(loadTime),
                      event_category: 'Load Time'
                    });
                  }
                });
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ErrorBoundary>
          <SessionProvider>
            <ReactQueryProvider>
              <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
              <div className="relative">
                <div className="fixed bottom-2 right-4 z-50">
                  <HealthCheck />
                </div>
                {children}
                <Toaster richColors position="top-right" />
              </div>
        </ThemeProvider>

            </ReactQueryProvider>
          </SessionProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}