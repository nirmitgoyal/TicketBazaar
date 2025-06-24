/**
 * Advanced console cleaning utility to suppress development noise
 * while preserving important debugging information
 */

interface ConsoleFilter {
  patterns: string[];
  level: 'error' | 'warn' | 'log' | 'debug';
}

class ConsoleManager {
  private static instance: ConsoleManager;
  private originalMethods: {
    error: typeof console.error;
    warn: typeof console.warn;
    log: typeof console.log;
    debug: typeof console.debug;
  };
  
  private filters: ConsoleFilter[] = [
    {
      level: 'error',
      patterns: [
        'Script error',
        'Failed to fetch dynamically imported module',
        'Loading chunk',
        'gmp-',
        'already defined',
        'WebSocket',
        'DOMException',
        'TypeError: Failed to fetch',
        'Element with name'
      ]
    },
    {
      level: 'warn',
      patterns: [
        'already defined',
        'gmp-',
        'Element with name',
        'Google Maps'
      ]
    }
  ];

  constructor() {
    this.originalMethods = {
      error: console.error.bind(console),
      warn: console.warn.bind(console),
      log: console.log.bind(console),
      debug: console.debug.bind(console)
    };
    
    this.setupFilters();
  }

  static getInstance(): ConsoleManager {
    if (!ConsoleManager.instance) {
      ConsoleManager.instance = new ConsoleManager();
    }
    return ConsoleManager.instance;
  }

  private setupFilters(): void {
    // Filter console.error
    console.error = (...args: any[]) => {
      if (this.shouldFilter('error', args)) {
        return;
      }
      this.originalMethods.error(...args);
    };

    // Filter console.warn
    console.warn = (...args: any[]) => {
      if (this.shouldFilter('warn', args)) {
        return;
      }
      this.originalMethods.warn(...args);
    };
  }

  private shouldFilter(level: 'error' | 'warn' | 'log' | 'debug', args: any[]): boolean {
    const message = args.join(' ').toLowerCase();
    const filter = this.filters.find(f => f.level === level);
    
    if (!filter) return false;
    
    return filter.patterns.some(pattern => 
      message.includes(pattern.toLowerCase())
    );
  }

  /**
   * Allow specific patterns through the filter
   */
  allowPattern(pattern: string, level: 'error' | 'warn' | 'log' | 'debug' = 'error'): void {
    const filter = this.filters.find(f => f.level === level);
    if (filter) {
      filter.patterns = filter.patterns.filter(p => p !== pattern);
    }
  }

  /**
   * Block additional patterns
   */
  blockPattern(pattern: string, level: 'error' | 'warn' | 'log' | 'debug' = 'error'): void {
    const filter = this.filters.find(f => f.level === level);
    if (filter && !filter.patterns.includes(pattern)) {
      filter.patterns.push(pattern);
    }
  }

  /**
   * Restore original console methods
   */
  restore(): void {
    console.error = this.originalMethods.error;
    console.warn = this.originalMethods.warn;
    console.log = this.originalMethods.log;
    console.debug = this.originalMethods.debug;
  }

  /**
   * Get current filter configuration
   */
  getFilters(): ConsoleFilter[] {
    return [...this.filters];
  }
}

// Initialize console cleaning
export const consoleManager = ConsoleManager.getInstance();

// Development-only feature
if (import.meta.env.DEV) {
  // Expose to window for debugging
  (window as any).__consoleManager = consoleManager;
}

export default consoleManager;