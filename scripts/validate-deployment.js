#!/usr/bin/env node
/**
 * Deployment validation script to check if static assets are served with correct MIME types
 */

const testUrl = 'https://ticketbazaar.co.in';

const testPaths = [
  '/',
  '/assets/index-Cj0Nw6uN.js',
  '/assets/index-DZDHe5G3.css',
  '/assets/vendor-react-C5NW_hoV.js',
  '/assets/vendor-query-De1s92eq.js',
  '/assets/vendor-router-DCI1QbIU.js',
  '/assets/vendor-ui-oA-1vpcV.js',
  '/assets/vendor-utils-BCmzG2VI.js',
  '/assets/vendor-forms-B9PZ2KS_.js',
  '/favicon.ico'
];

async function validateDeployment() {
  console.log('🔍 Validating deployment MIME types...\n');
  
  for (const path of testPaths) {
    try {
      const url = `${testUrl}${path}`;
      const response = await fetch(url, { method: 'HEAD' });
      const contentType = response.headers.get('content-type');
      const cacheControl = response.headers.get('cache-control');
      
      console.log(`✓ ${path}`);
      console.log(`  Status: ${response.status}`);
      console.log(`  Content-Type: ${contentType}`);
      console.log(`  Cache-Control: ${cacheControl}`);
      console.log('');
      
      // Validate JavaScript MIME types
      if (path.endsWith('.js') && !contentType?.includes('application/javascript')) {
        console.error(`❌ ERROR: JavaScript file has wrong MIME type: ${contentType}`);
        process.exit(1);
      }
      
      // Validate CSS MIME types
      if (path.endsWith('.css') && !contentType?.includes('text/css')) {
        console.error(`❌ ERROR: CSS file has wrong MIME type: ${contentType}`);
        process.exit(1);
      }
      
    } catch (error) {
      console.error(`❌ ERROR testing ${path}:`, error.message);
      process.exit(1);
    }
  }
  
  console.log('✅ All MIME types are correct!');
}

validateDeployment().catch(console.error);
