// Console filter to remove irrelevant warnings and logs
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;
const originalConsoleLog = console.log;

const FILTERED_WARNINGS = [
  'Performance warning! LoadScript has been reloaded unintentionally',
  'You should not pass `libraries` prop as new array',
  'keep an array of libraries as static class property',
];

const FILTERED_ERRORS = [
  'WebSocket connection',
  '[vite] server connection lost',
  '[vite] connecting',
  '[vite] connected',
  'WebSocket error in development mode',
  'WebSocket closed abnormally',
  'WebSocket reconnecting',
];

function shouldFilterMessage(message: string, filters: string[]): boolean {
  return filters.some(filter => message.includes(filter));
}

// Override console.warn to filter out irrelevant warnings
console.warn = (...args: any[]) => {
  const message = args.join(' ');
  if (!shouldFilterMessage(message, FILTERED_WARNINGS)) {
    originalConsoleWarn.apply(console, args);
  }
};

// Override console.error to filter out irrelevant errors
console.error = (...args: any[]) => {
  const message = args.join(' ');
  if (!shouldFilterMessage(message, FILTERED_ERRORS)) {
    originalConsoleError.apply(console, args);
  }
};

// Keep console.log as is for now, but could be filtered in production
console.log = (...args: any[]) => {
  const message = args.join(' ');
  
  // Filter out HMR and development-only logs in production
  if (import.meta.env.PROD) {
    const devOnlyFilters = [
      '[vite]',
      '[hmr]',
      'hot updated',
      'WebSocket patch applied',
    ];
    
    if (!shouldFilterMessage(message, devOnlyFilters)) {
      originalConsoleLog.apply(console, args);
    }
  } else {
    originalConsoleLog.apply(console, args);
  }
};

export { originalConsoleWarn, originalConsoleError, originalConsoleLog };