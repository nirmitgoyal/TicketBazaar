/**
 * Simple logging utility for the fraud detection system
 * Provides structured logging with categories and error handling
 */

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  category: string;
  message: string;
  data?: any;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // Keep last 1000 logs in memory

  private formatMessage(level: 'info' | 'warn' | 'error', category: string, message: string, data?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data
    };
  }

  private addLog(entry: LogEntry) {
    this.logs.push(entry);
    
    // Keep only recent logs in memory
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output for development
    const prefix = `[${entry.level.toUpperCase()}] [${entry.category}]`;
    const output = entry.data ? 
      `${prefix} ${entry.message}` : 
      `${prefix} ${entry.message}`;

    switch (entry.level) {
      case 'error':
        console.error(output, entry.data || '');
        break;
      case 'warn':
        console.warn(output, entry.data || '');
        break;
      default:
        console.log(output, entry.data || '');
    }
  }

  info(category: string, message: string, data?: any) {
    const entry = this.formatMessage('info', category, message, data);
    this.addLog(entry);
  }

  warn(category: string, message: string, data?: any) {
    const entry = this.formatMessage('warn', category, message, data);
    this.addLog(entry);
  }

  error(category: string, message: string, data?: any) {
    const entry = this.formatMessage('error', category, message, data);
    this.addLog(entry);
  }

  // Get recent logs for debugging
  getRecentLogs(limit: number = 100): LogEntry[] {
    return this.logs.slice(-limit);
  }

  // Get logs by category
  getLogsByCategory(category: string, limit: number = 100): LogEntry[] {
    return this.logs
      .filter(log => log.category === category)
      .slice(-limit);
  }

  // Clear old logs
  clearLogs() {
    this.logs = [];
  }
}

// Export singleton instance
export const logger = new Logger();

// Export types for use in other modules
export type { LogEntry };