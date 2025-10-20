class ErrorTracker {
  private static instance: ErrorTracker
  private isInitialized = false

  private constructor() {}

  static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker()
    }
    return ErrorTracker.instance
  }

  init() {
    if (this.isInitialized) return

    // Track unhandled errors
    window.addEventListener('error', (event) => {
      this.track('unhandled_error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error?.toString()
      })
    })

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.track('unhandled_rejection', {
        reason: event.reason?.toString()
      })
    })

    this.isInitialized = true
  }

  track(errorType: string, details: Record<string, any> = {}) {
    // In production, this would send to your error tracking service
    console.error(`[ErrorTracker] ${errorType}:`, {
      ...details,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    })

    // Example: Send to analytics service
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: errorType,
        fatal: false
      })
    }
  }

  captureException(error: Error, context?: Record<string, any>) {
    this.track('captured_exception', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...context
    })
  }
}

export const errorTracker = ErrorTracker.getInstance()