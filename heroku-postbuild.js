// Heroku post-build script
import { execSync } from 'child_process';

console.log('🚀 Starting Heroku post-build process...');

// Validate critical environment variables
if (!process.env.DATABASE_URL) {
  console.warn('⚠️ DATABASE_URL not set. Database operations may fail.');
}

try {
  // Install all dependencies (including dev dependencies for build tools)
  console.log('📦 Installing dependencies...');
  execSync('npm ci', { stdio: 'inherit' });
  
  // Verify critical dependencies are installed
  console.log('🔍 Verifying OAuth dependencies...');
  try {
    execSync('node -e "require(\'passport-google-oauth20\')"', { stdio: 'inherit' });
    console.log('✅ passport-google-oauth20 dependency verified');
  } catch (depError) {
    console.warn('⚠️ passport-google-oauth20 not found, installing...');
    execSync('npm install passport-google-oauth20', { stdio: 'inherit' });
  }

  // Push database schema using npx to ensure drizzle-kit is available
  console.log('🗄️ Setting up database...');
  try {
    execSync('npx drizzle-kit push', { stdio: 'inherit' });
  } catch (dbError) {
    console.warn('⚠️ Database setup failed, continuing with build...', dbError.message);
    // Continue with build even if DB setup fails
  }

  // Build the application
  console.log('🔨 Building application...');
  execSync('npx vite build', { stdio: 'inherit' });

  // Build the server with esbuild
  console.log('🔧 Building server with esbuild...');
  execSync('npx esbuild server/production-index.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/index.js', { stdio: 'inherit' });

  // Verify the build output
  console.log('🔍 Verifying build output...');
  execSync('ls -la dist/', { stdio: 'inherit' });

  console.log('✅ Heroku post-build completed successfully!');
} catch (error) {
  console.error('❌ Heroku post-build failed:', error.message);
  process.exit(1);
}