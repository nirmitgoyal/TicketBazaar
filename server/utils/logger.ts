/**
 * Enhanced logging utility with different levels and formatting
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

interface LogEntry {
  level: LogLevel;
  module: string;
  message: string;
  data?: any;
  timestamp: Date;
  requestId?: string;
}

class Logger {
  private currentLevel: LogLevel;
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  constructor(level: LogLevel = LogLevel.INFO) {
    this.currentLevel = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.currentLevel;
  }

  private formatMessage(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const levelName = LogLevel[entry.level];
    const requestId = entry.requestId ? ` [${entry.requestId}]` : '';
    
    return `[${timestamp}] [${levelName}] [${entry.module}]${requestId} ${entry.message}`;
  }

  private log(level: LogLevel, module: string, message: string, data?: any, requestId?: string) {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      module,
      message,
      data,
      timestamp: new Date(),
      requestId,
    };

    this.logs.push(entry);
    
    // Keep only recent logs to prevent memory leaks
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    const formattedMessage = this.formatMessage(entry);
    
    switch (level) {
      case LogLevel.ERROR:
        console.error(formattedMessage, data);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage, data);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage, data);
        break;
      case LogLevel.DEBUG:
        console.debug(formattedMessage, data);
        break;
    }
  }

  error(module: string, message: string, data?: any, requestId?: string) {
    this.log(LogLevel.ERROR, module, message, data, requestId);
  }

  warn(module: string, message: string, data?: any, requestId?: string) {
    this.log(LogLevel.WARN, module, message, data, requestId);
  }

  info(module: string, message: string, data?: any, requestId?: string) {
    this.log(LogLevel.INFO, module, message, data, requestId);
  }

  debug(module: string, message: string, data?: any, requestId?: string) {
    this.log(LogLevel.DEBUG, module, message, data, requestId);
  }

  getLogs(level?: LogLevel, module?: string): LogEntry[] {
    let filteredLogs = this.logs;

    if (level !== undefined) {
      filteredLogs = filteredLogs.filter(log => log.level === level);
    }

    if (module) {
      filteredLogs = filteredLogs.filter(log => log.module === module);
    }

    return filteredLogs;
  }

  clearLogs() {
    this.logs = [];
  }

  setLevel(level: LogLevel) {
    this.currentLevel = level;
  }
}

export const logger = new Logger(
  process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO
);