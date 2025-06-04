#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔍 Heroku Deployment Readiness Check');
console.log('=====================================');

let hasErrors = false;

// 1. Check essential files exist
const requiredFiles = [
  'package.json',
  'Procfile',
  'heroku-postbuild.js',
  'server/production-index.ts',
  'drizzle.config.ts',
  'shared/schema.ts'
];

console.log('\n📁 Checking required files...');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} missing`);
    hasErrors = true;
  }
});

// 2. Check Procfile points to correct file
console.log('\n🚀 Checking Procfile configuration...');
const procfileContent = fs.readFileSync('Procfile', 'utf8').trim();
if (procfileContent.includes('dist/index.js')) {
  console.log('✅ Procfile points to correct build output');
} else {
  console.log('❌ Procfile should point to dist/index.js');
  hasErrors = true;
}

// 3. Test build process
console.log('\n🔨 Testing build process...');
try {
  execSync('npx vite build', { stdio: 'pipe' });
  console.log('✅ Frontend build successful');
} catch (error) {
  console.log('❌ Frontend build failed');
  console.log(error.stdout?.toString() || error.message);
  hasErrors = true;
}

try {
  execSync('npx esbuild server/production-index.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/index.js', { stdio: 'pipe' });
  console.log('✅ Server build successful');
} catch (error) {
  console.log('❌ Server build failed');
  console.log(error.stdout?.toString() || error.message);
  hasErrors = true;
}

// 4. Check if dist directory has correct structure
console.log('\n📦 Checking build output structure...');
if (fs.existsSync('dist/index.js')) {
  console.log('✅ Server bundle created');
} else {
  console.log('❌ Server bundle missing');
  hasErrors = true;
}

if (fs.existsSync('dist/public')) {
  console.log('✅ Frontend build output exists');
} else {
  console.log('❌ Frontend build output missing');
  hasErrors = true;
}

// 5. Check environment variable requirements
console.log('\n🔐 Checking environment variable configuration...');
const envVars = ['DATABASE_URL', 'SESSION_SECRET'];
envVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`✅ ${varName} is set`);
  } else {
    console.log(`⚠️  ${varName} not set (required for production)`);
  }
});

// 6. Check database schema can be loaded
console.log('\n🗄️  Checking database schema...');
try {
  const schema = await import('./shared/schema.ts');
  if (schema.users && schema.tickets) {
    console.log('✅ Database schema loads correctly');
  } else {
    console.log('❌ Database schema incomplete');
    hasErrors = true;
  }
} catch (error) {
  console.log('❌ Database schema failed to load');
  console.log(error.message);
  hasErrors = true;
}

// 7. Check Node.js compatibility
console.log('\n⚙️  Checking Node.js compatibility...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const nodeVersion = process.version;
console.log(`✅ Current Node.js version: ${nodeVersion}`);
console.log(`✅ Required Node.js version: ${packageJson.engines?.node || 'not specified'}`);

// 8. Check for common Heroku deployment issues
console.log('\n🛡️  Checking for common deployment issues...');

// Check for absolute paths
const serverFiles = ['server/production-index.ts', 'server/routes.ts', 'server/auth.ts'];
serverFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('/repo/')) {
      console.log(`❌ ${file} contains absolute paths (/repo/)`);
      hasErrors = true;
    } else {
      console.log(`✅ ${file} uses relative paths`);
    }
  }
});

// Check session store configuration
console.log('\n🔐 Checking session configuration...');
const authContent = fs.readFileSync('server/auth.ts', 'utf8');
if (authContent.includes('connect-pg-simple')) {
  console.log('✅ PostgreSQL session store configured');
} else {
  console.log('❌ Session store not properly configured');
  hasErrors = true;
}

// 9. Memory and performance checks
console.log('\n💾 Performance recommendations...');
console.log('⚠️  Consider setting WEB_MEMORY=512 for basic Heroku dynos');
console.log('⚠️  Consider enabling HTTP/2 and gzip compression');

// Final summary
console.log('\n📋 Summary');
console.log('==========');
if (hasErrors) {
  console.log('❌ Deployment readiness check FAILED');
  console.log('Please fix the above issues before deploying to Heroku');
  process.exit(1);
} else {
  console.log('✅ Deployment readiness check PASSED');
  console.log('Your app appears ready for Heroku deployment!');
  console.log('\nNext steps:');
  console.log('1. git add .');
  console.log('2. git commit -m "Ready for Heroku deployment"');
  console.log('3. heroku create your-app-name');
  console.log('4. heroku addons:create heroku-postgresql:essential-0');
  console.log('5. heroku config:set SESSION_SECRET=$(openssl rand -base64 32)');
  console.log('6. git push heroku main');
}