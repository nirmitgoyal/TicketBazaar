import dotenv from "dotenv";

// Load environment variables
dotenv.config();

interface EnvironmentConfig {
  NODE_ENV: string;
  PORT: number;
  DATABASE_URL: string;
  SESSION_SECRET: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  PERPLEXITY_API_KEY?: string;
  HONEYBADGER_API_KEY?: string;
  FRONTEND_URL: string;
}

function validateEnvironment(): EnvironmentConfig {
  const requiredEnvVars = ['DATABASE_URL', 'SESSION_SECRET'];
  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT || '5000', 10),
    DATABASE_URL: process.env.DATABASE_URL!,
    SESSION_SECRET: process.env.SESSION_SECRET!,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY,
    HONEYBADGER_API_KEY: process.env.HONEYBADGER_API_KEY,
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5000'
  };
}

export const config = validateEnvironment();

export const isDevelopment = config.NODE_ENV === 'development';
export const isProduction = config.NODE_ENV === 'production';
export const isTest = config.NODE_ENV === 'test';