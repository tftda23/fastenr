// Environment-based logging utility for production-ready logging
// Provides structured logging with different levels and environment-based filtering

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  TRACE = 4,
}

export interface LogContext {
  userId?: string;
  organizationId?: string;
  requestId?: string;
  component?: string;
  action?: string;
  [key: string]: any;
}

class Logger {
  private level: LogLevel;
  private isDevelopment: boolean;
  private isProduction: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.isProduction = process.env.NODE_ENV === 'production';
    
    // Set log level based on environment
    this.level = this.getLogLevel();
  }

  private getLogLevel(): LogLevel {
    const envLevel = process.env.LOG_LEVEL?.toUpperCase();
    
    switch (envLevel) {
      case 'ERROR':
        return LogLevel.ERROR;
      case 'WARN':
        return LogLevel.WARN;
      case 'INFO':
        return LogLevel.INFO;
      case 'DEBUG':
        return LogLevel.DEBUG;
      case 'TRACE':
        return LogLevel.TRACE;
      default:
        // Default levels by environment
        if (this.isProduction) {
          return LogLevel.WARN; // Only warnings and errors in production
        } else if (process.env.NODE_ENV === 'test') {
          return LogLevel.ERROR; // Only errors in tests
        } else {
          return LogLevel.DEBUG; // Debug level in development
        }
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.level;
  }

  private formatMessage(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | ${JSON.stringify(context)}` : '';
    return `[${timestamp}] ${level}: ${message}${contextStr}`;
  }

  private log(level: LogLevel, levelName: string, message: string, context?: LogContext, data?: any): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const formattedMessage = this.formatMessage(levelName, message, context);

    // In production, use structured logging
    if (this.isProduction) {
      const logEntry = {
        timestamp: new Date().toISOString(),
        level: levelName,
        message,
        context,
        data,
        environment: 'production'
      };

      // Use appropriate console method based on level
      switch (level) {
        case LogLevel.ERROR:
          console.error(JSON.stringify(logEntry));
          break;
        case LogLevel.WARN:
          console.warn(JSON.stringify(logEntry));
          break;
        default:
          console.log(JSON.stringify(logEntry));
          break;
      }
    } else {
      // In development, use readable format
      switch (level) {
        case LogLevel.ERROR:
          console.error(formattedMessage, data || '');
          break;
        case LogLevel.WARN:
          console.warn(formattedMessage, data || '');
          break;
        case LogLevel.INFO:
          console.info(formattedMessage, data || '');
          break;
        case LogLevel.DEBUG:
          console.log(formattedMessage, data || '');
          break;
        case LogLevel.TRACE:
          console.trace(formattedMessage, data || '');
          break;
      }
    }
  }

  error(message: string, context?: LogContext, data?: any): void {
    this.log(LogLevel.ERROR, 'ERROR', message, context, data);
  }

  warn(message: string, context?: LogContext, data?: any): void {
    this.log(LogLevel.WARN, 'WARN', message, context, data);
  }

  info(message: string, context?: LogContext, data?: any): void {
    this.log(LogLevel.INFO, 'INFO', message, context, data);
  }

  debug(message: string, context?: LogContext, data?: any): void {
    this.log(LogLevel.DEBUG, 'DEBUG', message, context, data);
  }

  trace(message: string, context?: LogContext, data?: any): void {
    this.log(LogLevel.TRACE, 'TRACE', message, context, data);
  }

  // Convenience methods for common use cases
  apiRequest(method: string, path: string, context?: LogContext): void {
    this.info(`API ${method} ${path}`, { ...context, component: 'API' });
  }

  apiResponse(method: string, path: string, status: number, duration?: number, context?: LogContext): void {
    this.info(`API ${method} ${path} - ${status}`, { 
      ...context, 
      component: 'API', 
      status, 
      duration: duration ? `${duration}ms` : undefined 
    });
  }

  apiError(method: string, path: string, error: Error, context?: LogContext): void {
    this.error(`API ${method} ${path} - Error: ${error.message}`, { 
      ...context, 
      component: 'API', 
      error: error.stack 
    });
  }

  dbQuery(query: string, duration?: number, context?: LogContext): void {
    this.debug(`DB Query: ${query}`, { 
      ...context, 
      component: 'Database', 
      duration: duration ? `${duration}ms` : undefined 
    });
  }

  dbError(query: string, error: Error, context?: LogContext): void {
    this.error(`DB Query Error: ${query} - ${error.message}`, { 
      ...context, 
      component: 'Database', 
      error: error.stack 
    });
  }

  auth(action: string, userId?: string, context?: LogContext): void {
    this.info(`Auth: ${action}`, { 
      ...context, 
      component: 'Auth', 
      userId,
      action 
    });
  }

  authError(action: string, error: Error, context?: LogContext): void {
    this.error(`Auth Error: ${action} - ${error.message}`, { 
      ...context, 
      component: 'Auth', 
      error: error.stack 
    });
  }

  // Performance monitoring
  performance(operation: string, duration: number, context?: LogContext): void {
    const level = duration > 1000 ? LogLevel.WARN : LogLevel.DEBUG;
    const message = `Performance: ${operation} took ${duration}ms`;
    
    if (level === LogLevel.WARN) {
      this.warn(message, { ...context, component: 'Performance', duration });
    } else {
      this.debug(message, { ...context, component: 'Performance', duration });
    }
  }

  // Security logging
  security(event: string, context?: LogContext): void {
    this.warn(`Security: ${event}`, { ...context, component: 'Security' });
  }
}

// Create singleton instance
export const logger = new Logger();

// Export convenience functions for easier migration
export const log = {
  error: (message: string, context?: LogContext, data?: any) => logger.error(message, context, data),
  warn: (message: string, context?: LogContext, data?: any) => logger.warn(message, context, data),
  info: (message: string, context?: LogContext, data?: any) => logger.info(message, context, data),
  debug: (message: string, context?: LogContext, data?: any) => logger.debug(message, context, data),
  trace: (message: string, context?: LogContext, data?: any) => logger.trace(message, context, data),
};

// Development-only logging (completely removed in production)
export const devLog = {
  log: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(...args);
    }
  },
  warn: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(...args);
    }
  },
  error: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(...args);
    }
  },
};

export default logger;