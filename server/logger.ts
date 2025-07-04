export const logger = {
  info: (category: string, message: string, ...args: any[]) => {
    console.log(`[${new Date().toISOString()}] [INFO] [${category}] ${message}`, ...args);
  },
  error: (category: string, message: string, error?: any) => {
    console.error(`[${new Date().toISOString()}] [ERROR] [${category}] ${message}`, error);
  },
  warn: (category: string, message: string, ...args: any[]) => {
    console.warn(`[${new Date().toISOString()}] [WARN] [${category}] ${message}`, ...args);
  },
  debug: (category: string, message: string, ...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[${new Date().toISOString()}] [DEBUG] [${category}] ${message}`, ...args);
    }
  }
};