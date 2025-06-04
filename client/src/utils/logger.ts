interface LogEntry {
  timestamp: string;
  level: string;
  component: string;
  message: string;
  data?: any;
  userId?: number;
}

class ClientLogger {
  private isDevelopment: boolean;
  private enabledLevels: Set<string>;

  constructor() {
    this.isDevelopment = import.meta.env.DEV;
    this.enabledLevels = new Set(['error', 'warn']);
    
    // Enable more logging in development
    if (this.isDevelopment) {
      this.enabledLevels.add('info');
      this.enabledLevels.add('debug');
    }
  }

  private formatTime(): string {
    return new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  }

  private createLogEntry(level: string, component: string, message: string, data?: any, userId?: number): LogEntry {
    return {
      timestamp: this.formatTime(),
      level,
      component,
      message,
      data,
      userId,
    };
  }

  private formatLogMessage(entry: LogEntry): string {
    let msg = `${entry.timestamp} [${entry.level}] [${entry.component}] ${entry.message}`;
    
    if (entry.userId) {
      msg += ` | User: ${entry.userId}`;
    }

    return msg;
  }

  error(component: string, message: string, error?: any, userId?: number): void {
    if (!this.enabledLevels.has('error')) return;
    
    const entry = this.createLogEntry('ERROR', component, message, error, userId);
    console.error(this.formatLogMessage(entry));
    
    if (error && this.isDevelopment) {
      console.error('Error details:', error);
    }
  }

  warn(component: string, message: string, data?: any, userId?: number): void {
    if (!this.enabledLevels.has('warn')) return;
    
    const entry = this.createLogEntry('WARN', component, message, data, userId);
    console.warn(this.formatLogMessage(entry));
    
    if (data && this.isDevelopment) {
      console.warn('Warning data:', data);
    }
  }

  info(component: string, message: string, data?: any, userId?: number): void {
    if (!this.enabledLevels.has('info')) return;
    
    const entry = this.createLogEntry('INFO', component, message, data, userId);
    console.log(this.formatLogMessage(entry));
    
    if (data && this.isDevelopment) {
      console.log('Info data:', data);
    }
  }

  debug(component: string, message: string, data?: any, userId?: number): void {
    if (!this.enabledLevels.has('debug')) return;
    
    const entry = this.createLogEntry('DEBUG', component, message, data, userId);
    console.log(this.formatLogMessage(entry));
    
    if (data && this.isDevelopment) {
      console.log('Debug data:', data);
    }
  }

  // API operation logging
  apiRequest(method: string, url: string, status?: number, duration?: number, userId?: number): void {
    const message = `${method} ${url}${status ? ` ${status}` : ''}${duration ? ` in ${duration}ms` : ''}`;
    
    if (status && status >= 400) {
      this.error('API', message, undefined, userId);
    } else if (status && status >= 300) {
      this.warn('API', message, undefined, userId);
    } else {
      this.debug('API', message, undefined, userId);
    }
  }

  // User interaction logging
  userAction(action: string, component: string, details?: string, userId?: number): void {
    const message = `${action}${details ? ` - ${details}` : ''}`;
    this.info(component, message, undefined, userId);
  }

  // Performance logging
  performance(component: string, operation: string, duration: number, threshold: number = 1000): void {
    const message = `${operation} took ${duration}ms`;
    
    if (duration > threshold) {
      this.warn('PERFORMANCE', `Slow ${component}: ${message}`);
    } else {
      this.debug('PERFORMANCE', `${component}: ${message}`);
    }
  }
}

export const clientLogger = new ClientLogger();

// Performance measurement utility
export function measurePerformance<T>(
  component: string,
  operation: string,
  fn: () => T | Promise<T>
): T | Promise<T> {
  const startTime = performance.now();
  
  try {
    const result = fn();
    
    if (result instanceof Promise) {
      return result.finally(() => {
        const duration = performance.now() - startTime;
        clientLogger.performance(component, operation, duration);
      });
    } else {
      const duration = performance.now() - startTime;
      clientLogger.performance(component, operation, duration);
      return result;
    }
  } catch (error) {
    const duration = performance.now() - startTime;
    clientLogger.error(component, `${operation} failed after ${duration}ms`, error);
    throw error;
  }
}