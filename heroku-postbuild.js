
#!/usr/bin/env node

// Heroku post-build script
const { execSync } = require('child_process');

console.log('🚀 Starting Heroku post-build process...');

try {
  // Push database schema
  console.log('🗄️ Pushing database schema...');
  execSync('npm run db:push', { stdio: 'inherit' });

  // Build the application
  console.log('🔨 Building application...');
  execSync('vite build', { stdio: 'inherit' });
  execSync('esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', { stdio: 'inherit' });

  console.log('✅ Heroku post-build completed successfully!');
} catch (error) {
  console.error('❌ Heroku post-build failed:', error.message);
  process.exit(1);
}
