// Production console override - removes console statements in production
// This should be imported early in the application lifecycle

import { logger } from './logger';

// Store original console methods
const originalConsole = {
  log: console.log,
  warn: console.warn,
  error: console.error,
  info: console.info,
  debug: console.debug,
  trace: console.trace,
};

// Override console methods in production
export function overrideConsoleInProduction() {
  if (process.env.NODE_ENV === 'production') {
    // In production, redirect console calls to our logger or disable them
    console.log = (...args: any[]) => {
      // Optionally log to our structured logger instead
      if (process.env.LOG_CONSOLE_IN_PRODUCTION === 'true') {
        logger.debug('Console.log', {}, args);
      }
      // Otherwise, do nothing (silent)
    };

    console.warn = (...args: any[]) => {
      logger.warn('Console.warn', {}, args);
    };

    console.error = (...args: any[]) => {
      logger.error('Console.error', {}, args);
    };

    console.info = (...args: any[]) => {
      if (process.env.LOG_CONSOLE_IN_PRODUCTION === 'true') {
        logger.info('Console.info', {}, args);
      }
    };

    console.debug = (...args: any[]) => {
      if (process.env.LOG_CONSOLE_IN_PRODUCTION === 'true') {
        logger.debug('Console.debug', {}, args);
      }
    };

    console.trace = (...args: any[]) => {
      logger.trace('Console.trace', {}, args);
    };
  }
}

// Restore original console methods (useful for testing)
export function restoreConsole() {
  console.log = originalConsole.log;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
  console.info = originalConsole.info;
  console.debug = originalConsole.debug;
  console.trace = originalConsole.trace;
}

// Development-only console wrapper
export const devConsole = {
  log: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      originalConsole.log(...args);
    }
  },
  warn: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      originalConsole.warn(...args);
    }
  },
  error: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      originalConsole.error(...args);
    }
  },
  info: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      originalConsole.info(...args);
    }
  },
  debug: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      originalConsole.debug(...args);
    }
  },
};

// Initialize console override
if (typeof window === 'undefined') {
  // Server-side
  overrideConsoleInProduction();
}