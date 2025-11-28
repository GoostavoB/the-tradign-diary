/**
 * Error tracking and monitoring utilities
 * Centralized error handling for production monitoring
 */

interface ErrorContext {
  userId?: string;
  userEmail?: string;
  page?: string;
  action?: string;
  [key: string]: any;
}

class ErrorTracker {
  private errors: Array<{
    message: string;
    stack?: string;
    context?: ErrorContext;
    timestamp: Date;
  }> = [];

  /**
   * Track an error with context
   */
  captureError(error: Error, context?: ErrorContext) {
    const errorData = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date(),
    };

    this.errors.push(errorData);

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('Error tracked:', errorData);
    }

    // In production, you would send this to an error tracking service
    // Example: Sentry, LogRocket, Bugsnag, etc.
    if (import.meta.env.PROD) {
      this.sendToErrorService(errorData);
    }
  }

  /**
   * Track a message (non-error event)
   */
  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: ErrorContext) {
    const messageData = {
      message,
      level,
      context,
      timestamp: new Date(),
    };

    if (import.meta.env.DEV) {
      console.log(`[${level.toUpperCase()}]`, message, context);
    }

    if (import.meta.env.PROD && level === 'error') {
      this.sendToErrorService(messageData);
    }
  }

  /**
   * Send error to external service
   * Replace this with your actual error tracking service
   */
  private async sendToErrorService(data: any) {
    try {
      // Example: Send to your backend or external service
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data),
      // });
      
      console.log('Error logged:', data);
    } catch (error) {
      // Silently fail to avoid infinite error loops
      console.error('Failed to send error to tracking service', error);
    }
  }

  /**
   * Get recent errors (for debugging)
   */
  getRecentErrors(count: number = 10) {
    return this.errors.slice(-count);
  }

  /**
   * Clear error history
   */
  clearErrors() {
    this.errors = [];
  }
}

// Global error tracker instance
export const errorTracker = new ErrorTracker();

/**
 * Global error handler
 */
export const setupGlobalErrorHandling = () => {
  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    errorTracker.captureError(event.error, {
      page: window.location.pathname,
      action: 'uncaught_error',
    });
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    errorTracker.captureError(
      new Error(event.reason?.message || 'Unhandled promise rejection'),
      {
        page: window.location.pathname,
        action: 'unhandled_rejection',
        reason: event.reason,
      }
    );
  });
};

/**
 * Wrap async functions with error tracking
 */
export const withErrorTracking = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: ErrorContext
): T => {
  return (async (...args: any[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      errorTracker.captureError(error as Error, context);
      throw error;
    }
  }) as T;
};
