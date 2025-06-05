#!/usr/bin/env node

// Simplified build script for deployment
import { execSync } from "child_process";

console.log("🚀 Starting deployment build process...");

try {
  // Install dependencies
  console.log("📦 Installing dependencies...");
  execSync("npm ci --production=false", { stdio: "inherit" });

  // Run database migrations
  console.log("🗄️ Pushing database schema...");
  execSync("npm run db:push", { stdio: "inherit" });

  // Build the application
  console.log("🔨 Building application...");
  execSync("vite build", { stdio: "inherit" });
  execSync("esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist", { stdio: "inherit" });

  console.log("✅ Build completed successfully!");
  console.log("🎉 Application is ready for deployment!");
} catch (error) {
  console.error("❌ Build failed:", error.message);
  process.exit(1);
}