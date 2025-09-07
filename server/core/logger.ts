/**
 * Logger
 * 
 * This module provides centralized logging functionality.
 */

import { Request, Response } from 'express';

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  data?: any;
  context?: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  private log(level: LogLevel, message: string, data?: any, context?: string): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      data,
      context,
    };

    this.logs.push(entry);

    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Output to console
    const logData = data ? JSON.stringify(data, null, 2) : '';
    const contextStr = context ? `[${context}]` : '';
    const timestamp = entry.timestamp.toISOString();

    switch (level) {
      case LogLevel.ERROR:
        console.error(`${timestamp} ${contextStr} ERROR: ${message}`, logData);
        break;
      case LogLevel.WARN:
        console.warn(`${timestamp} ${contextStr} WARN: ${message}`, logData);
        break;
      case LogLevel.INFO:
        console.info(`${timestamp} ${contextStr} INFO: ${message}`, logData);
        break;
      case LogLevel.DEBUG:
        if (process.env.NODE_ENV === 'development') {
          console.debug(`${timestamp} ${contextStr} DEBUG: ${message}`, logData);
        }
        break;
    }
  }

  error(message: string, data?: any, context?: string): void {
    this.log(LogLevel.ERROR, message, data, context);
  }

  warn(message: string, data?: any, context?: string): void {
    this.log(LogLevel.WARN, message, data, context);
  }

  info(message: string, data?: any, context?: string): void {
    this.log(LogLevel.INFO, message, data, context);
  }

  debug(message: string, data?: any, context?: string): void {
    this.log(LogLevel.DEBUG, message, data, context);
  }

  /**
   * Get recent logs
   */
  getRecentLogs(limit = 50): LogEntry[] {
    return this.logs.slice(-limit);
  }

  /**
   * Clear logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Create request logger middleware
   */
  requestLogger() {
    return (req: Request, res: Response, next: Function) => {
      const start = Date.now();
      const { method, path, query, body } = req;
      const userId = req.session?.userId;

      this.info(`${method} ${path}`, {
        query,
        body: method === 'POST' || method === 'PUT' ? body : undefined,
        userId,
      }, 'HTTP');

      res.on('finish', () => {
        const duration = Date.now() - start;
        const { statusCode } = res;
        
        const logLevel = statusCode >= 400 
          ? LogLevel.ERROR 
          : LogLevel.INFO;

        this.log(logLevel, `${method} ${path} - ${statusCode} (${duration}ms)`, {
          statusCode,
          duration,
          userId,
        }, 'HTTP');
      });

      next();
    };
  }
}

export const logger = new Logger();