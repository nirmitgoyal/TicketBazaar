// Heroku post-build script
import { execSync } from 'child_process';

console.log('🚀 Starting Heroku post-build process...');

try {
  // Install all dependencies (including dev dependencies for build tools)
  console.log('📦 Installing dependencies...');
  execSync('npm ci', { stdio: 'inherit' });

  // Push database schema using npx to ensure drizzle-kit is available
  console.log('🗄️ Setting up database...');
  execSync('npx drizzle-kit push', { stdio: 'inherit' });

  // Build the application
  console.log('🔨 Building application...');
  execSync('npx vite build', { stdio: 'inherit' });

  // Build the server with esbuild
  console.log('🔧 Building server with esbuild...');
  execSync('npx esbuild server/production-index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', { stdio: 'inherit' });

  // Verify the build output
  console.log('🔍 Verifying build output...');
  execSync('ls -la dist/', { stdio: 'inherit' });

  console.log('✅ Heroku post-build completed successfully!');
} catch (error) {
  console.error('❌ Heroku post-build failed:', error.message);
  process.exit(1);
}