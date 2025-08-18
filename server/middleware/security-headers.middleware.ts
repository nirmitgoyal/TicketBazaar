import { Request, Response, NextFunction } from "express";

/**
 * Set comprehensive security headers
 */
export function setSecurityHeaders(req: Request, res: Response, next: NextFunction) {
  // Prevent clickjacking - but allow Instagram's WebView
  const userAgent = req.headers['user-agent'] || '';
  const isInstagramWebView = /Instagram/i.test(userAgent);
  
  // Allow Instagram's WebView but deny other frames
  if (isInstagramWebView) {
    // For Instagram WebView, we'll omit X-Frame-Options to allow framing
    // but add CSP frame-ancestors directive for better control
    console.log('Instagram WebView detected, allowing frame embedding');
  } else {
    res.setHeader('X-Frame-Options', 'DENY');
  }
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Prevent referrer information leakage
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Force HTTPS in production
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  // Content Security Policy - conditionally include Google domains
  const isTestEnvironment = process.env.NODE_ENV === 'test' || 
                            process.env.CI === 'true' || 
                            req.headers['x-test-environment'] === 'true';
  
  const baseScriptSrc = "'self' 'unsafe-inline'";
  const baseStyleSrc = "'self' 'unsafe-inline'";
  const baseFontSrc = "'self'";
  const baseConnectSrc = "'self'";
  
  // Only include Google domains in non-test environments
  const scriptSrc = isTestEnvironment 
    ? baseScriptSrc 
    : `${baseScriptSrc} https://maps.googleapis.com https://www.googletagmanager.com https://pagead2.googlesyndication.com`;
    
  const styleSrc = isTestEnvironment 
    ? baseStyleSrc 
    : `${baseStyleSrc} https://fonts.googleapis.com`;
    
  const fontSrc = isTestEnvironment 
    ? baseFontSrc 
    : `${baseFontSrc} https://fonts.gstatic.com`;
    
  const connectSrc = isTestEnvironment 
    ? baseConnectSrc 
    : `${baseConnectSrc} https://maps.googleapis.com https://www.google-analytics.com`;

  // CSP frame-ancestors for better clickjacking protection
  const frameAncestors = isInstagramWebView 
    ? "'self' https://*.instagram.com https://*.facebook.com" 
    : "'none'";

  const cspPolicy = [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    `style-src ${styleSrc}`,
    `font-src ${fontSrc}`,
    "img-src 'self' data: https: blob:",
    `connect-src ${connectSrc}`,
    "frame-src 'none'",
    `frame-ancestors ${frameAncestors}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');
  
  res.setHeader('Content-Security-Policy', cspPolicy);
  
  // Remove server information
  res.removeHeader('X-Powered-By');
  
  next();
}