
#!/usr/bin/env node

// Heroku post-build script
const { execSync } = require('child_process');

console.log('🚀 Starting Heroku post-build process...');

try {
  // Install all dependencies including dev dependencies for build
  console.log('📦 Installing dependencies...');
  execSync('npm ci', { stdio: 'inherit' });

  // Push database schema
  console.log('🗄️ Pushing database schema...');
  execSync('npm run db:push', { stdio: 'inherit' });

  // Build the application
  console.log('🔨 Building application...');
  execSync('npx vite build', { stdio: 'inherit' });
  execSync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist --external:vite --external:@vitejs/plugin-react --external:@replit/vite-plugin-* --external:./vite.ts --external:../vite.config.ts', { stdio: 'inherit' });

  console.log('✅ Heroku post-build completed successfully!');
} catch (error) {
  console.error('❌ Heroku post-build failed:', error.message);
  process.exit(1);
}
