
// Heroku post-build script
import { execSync } from 'child_process';

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
  execSync('vite build', { stdio: 'inherit' });
  
  // Ensure esbuild is available and build the server
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
