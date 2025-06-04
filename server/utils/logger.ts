import { Request, Response } from 'express';

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

interface LogEntry {
  timestamp: string;
  level: string;
  source: string;
  message: string;
  data?: any;
  userId?: number;
  requestId?: string;
}

class Logger {
  private logLevel: LogLevel;
  private isDevelopment: boolean;

  constructor() {
    this.logLevel = process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG;
    this.isDevelopment = process.env.NODE_ENV !== 'production';
  }

  private formatTime(): string {
    return new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.logLevel;
  }

  private createLogEntry(level: string, source: string, message: string, data?: any, userId?: number, requestId?: string): LogEntry {
    return {
      timestamp: this.formatTime(),
      level,
      source,
      message,
      data,
      userId,
      requestId,
    };
  }

  private formatLogMessage(entry: LogEntry): string {
    let msg = `${entry.timestamp} [${entry.level}] [${entry.source}] ${entry.message}`;
    
    if (entry.userId) {
      msg += ` | User: ${entry.userId}`;
    }
    
    if (entry.requestId) {
      msg += ` | Request: ${entry.requestId}`;
    }

    return msg;
  }

  error(source: string, message: string, error?: any, userId?: number, requestId?: string): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;
    
    const entry = this.createLogEntry('ERROR', source, message, error, userId, requestId);
    console.error(this.formatLogMessage(entry));
    
    if (error && this.isDevelopment) {
      console.error('Error details:', error);
    }
  }

  warn(source: string, message: string, data?: any, userId?: number, requestId?: string): void {
    if (!this.shouldLog(LogLevel.WARN)) return;
    
    const entry = this.createLogEntry('WARN', source, message, data, userId, requestId);
    console.warn(this.formatLogMessage(entry));
    
    if (data && this.isDevelopment) {
      console.warn('Warning data:', data);
    }
  }

  info(source: string, message: string, data?: any, userId?: number, requestId?: string): void {
    if (!this.shouldLog(LogLevel.INFO)) return;
    
    const entry = this.createLogEntry('INFO', source, message, data, userId, requestId);
    console.log(this.formatLogMessage(entry));
    
    if (data && this.isDevelopment) {
      console.log('Info data:', data);
    }
  }

  debug(source: string, message: string, data?: any, userId?: number, requestId?: string): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    
    const entry = this.createLogEntry('DEBUG', source, message, data, userId, requestId);
    console.log(this.formatLogMessage(entry));
    
    if (data && this.isDevelopment) {
      console.log('Debug data:', data);
    }
  }

  // HTTP request logging
  httpRequest(req: Request, res: Response, duration: number): void {
    const userId = (req.user as any)?.id;
    const requestId = req.headers['x-request-id'] as string;
    const status = res.statusCode;
    const method = req.method;
    const url = req.originalUrl;
    
    // Skip logging static assets and frequent polling endpoints
    if (url.includes('/assets/') || url.includes('/favicon') || url.includes('hot-update')) {
      return;
    }
    
    const message = `${method} ${url} ${status} in ${duration}ms`;
    
    if (status >= 400) {
      this.error('HTTP', message, undefined, userId, requestId);
    } else if (status >= 300) {
      this.warn('HTTP', message, undefined, userId, requestId);
    } else if (duration > 1000) {
      // Log slow requests
      this.warn('HTTP', `Slow request: ${message}`, undefined, userId, requestId);
    } else if (this.isDevelopment || duration > 500) {
      // Log normal requests in development or slower requests in production
      this.info('HTTP', message, undefined, userId, requestId);
    }
  }

  // Database operation logging
  dbOperation(operation: string, table: string, duration: number, userId?: number, error?: any): void {
    if (error) {
      this.error('DATABASE', `${operation} on ${table} failed`, error, userId);
    } else if (duration > 2000) {
      // Only log very slow database operations (>2s)
      this.warn('DATABASE', `Very slow ${operation} on ${table} completed in ${duration}ms`, undefined, userId);
    }
    // Skip all normal database operation logging to reduce console noise
  }

  // Authentication logging
  auth(action: string, userId?: number, email?: string, error?: any): void {
    const userInfo = userId ? `User ${userId}` : email ? `Email ${email}` : 'Unknown user';
    const message = `${action} - ${userInfo}`;
    
    if (error) {
      this.warn('AUTH', `${action} failed - ${userInfo}`, error);
    } else {
      this.info('AUTH', message);
    }
  }

  // Business logic logging
  business(action: string, details: string, userId?: number, data?: any): void {
    this.info('BUSINESS', `${action} - ${details}`, data, userId);
  }

  // Performance logging
  performance(operation: string, duration: number, threshold: number = 1000): void {
    const message = `${operation} took ${duration}ms`;
    
    if (duration > threshold) {
      this.warn('PERFORMANCE', `Slow operation: ${message}`);
    } else {
      this.debug('PERFORMANCE', message);
    }
  }
}

export const logger = new Logger();

// Middleware to add request ID and logging
export function requestLoggingMiddleware(req: Request, res: Response, next: Function): void {
  const requestId = Math.random().toString(36).substring(2, 15);
  req.headers['x-request-id'] = requestId;
  
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.httpRequest(req, res, duration);
  });
  
  next();
}