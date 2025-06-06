import { Request } from 'express';

// Initialize Honeybadger instance
let honeybadgerInstance: any = null;

// Initialize and configure Honeybadger
export const initHoneybadger = async () => {
  if (!honeybadgerInstance) {
    try {
      // Dynamic import for CommonJS module compatibility
      const HoneybadgerModule = await import('@honeybadger-io/js');
      honeybadgerInstance = HoneybadgerModule.default || HoneybadgerModule;
      
      // Configure Honeybadger
      honeybadgerInstance.configure({
        apiKey: process.env.HONEYBADGER_API_KEY || "hbp_MB0R3crxF3cFxyEcYJXMpPUM9CY9Fd3OTtmV",
        environment: process.env.NODE_ENV || 'production',
        revision: process.env.HONEYBADGER_REVISION,
        reportData: true,
        developmentEnvironments: ['development', 'test']
      });
      
      console.log('Honeybadger initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Honeybadger:', error);
    }
  }
  return honeybadgerInstance;
};

// Helper function to set user context
export async function setUserContext(userId?: number, userEmail?: string) {
  const hb = await initHoneybadger();
  if (hb) {
    hb.setContext({
      user_id: userId,
      user_email: userEmail
    });
  }
}

// Helper function to set custom context
export async function setContext(context: Record<string, any>) {
  const hb = await initHoneybadger();
  if (hb) {
    hb.setContext(context);
  }
}

// Helper function to manually notify errors with context
export async function notifyError(error: Error, context?: Record<string, any>) {
  const hb = await initHoneybadger();
  if (hb) {
    if (context) {
      hb.setContext(context);
    }
    hb.notify(error);
  }
}

// Helper function for async error notification (useful for serverless)
export async function notifyErrorAsync(error: Error, context?: Record<string, any>) {
  const hb = await initHoneybadger();
  if (hb) {
    if (context) {
      hb.setContext(context);
    }
    return await hb.notifyAsync(error);
  }
}

// Helper function to extract user context from request
export function extractUserContext(req: Request) {
  return {
    url: req.url,
    method: req.method,
    params: req.params,
    query: req.query,
    // Don't include sensitive headers like authorization
    headers: {
      'user-agent': req.headers['user-agent'],
      'content-type': req.headers['content-type'],
      'accept': req.headers['accept']
    },
    user_id: (req as any).user?.id,
    user_email: (req as any).user?.email
  };
}

// Get middleware functions
export async function getMiddleware() {
  const hb = await initHoneybadger();
  return {
    requestHandler: hb?.requestHandler || ((req: any, res: any, next: any) => next()),
    errorHandler: hb?.errorHandler || ((err: any, req: any, res: any, next: any) => next(err))
  };
}

export default initHoneybadger;