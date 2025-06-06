import { Request } from 'express';

// Import Honeybadger using dynamic import since it's a CommonJS module
let Honeybadger: any;

// Initialize Honeybadger
const initializeHoneybadger = async () => {
  if (!Honeybadger) {
    Honeybadger = await import('@honeybadger-io/js').then(m => m.default || m);
    
    // Configure Honeybadger with API key from environment
    Honeybadger.configure({
      apiKey: process.env.HONEYBADGER_API_KEY,
      environment: process.env.NODE_ENV || 'development',
      revision: process.env.HONEYBADGER_REVISION,
      reportData: true,
      // Enable development mode logging when not in production
      developmentEnvironments: ['development', 'test']
    });
  }
  return Honeybadger;
};

// Helper function to set user context
export function setUserContext(userId?: number, userEmail?: string) {
  Honeybadger.setContext({
    user_id: userId,
    user_email: userEmail
  });
}

// Helper function to set custom context
export function setContext(context: Record<string, any>) {
  Honeybadger.setContext(context);
}

// Helper function to manually notify errors with context
export function notifyError(error: Error, context?: Record<string, any>) {
  if (context) {
    Honeybadger.setContext(context);
  }
  Honeybadger.notify(error);
}

// Helper function for async error notification (useful for serverless)
export async function notifyErrorAsync(error: Error, context?: Record<string, any>) {
  if (context) {
    Honeybadger.setContext(context);
  }
  return await Honeybadger.notifyAsync(error);
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

export default Honeybadger;