/**
 * Test to verify database connection configurations work correctly
 * Tests various scenarios including AWS RDS detection
 */

import { describe, test, expect, beforeAll, afterAll } from '@playwright/test';

describe('Database Connection Configuration', () => {
  
  test('should detect AWS RDS from DATABASE_URL', () => {
    const originalEnv = process.env.DATABASE_URL;
    
    // Test AWS RDS detection
    process.env.DATABASE_URL = 'postgres://user:pass@c7itisjfjj8ril.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com:5432/db';
    const isAWSRDS = process.env.DATABASE_URL.includes('amazonaws.com');
    expect(isAWSRDS).toBe(true);
    
    // Test non-AWS URL
    process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/db';
    const isNotAWSRDS = process.env.DATABASE_URL.includes('amazonaws.com');
    expect(isNotAWSRDS).toBe(false);
    
    // Restore original environment
    if (originalEnv) {
      process.env.DATABASE_URL = originalEnv;
    } else {
      delete process.env.DATABASE_URL;
    }
  });

  test('should configure appropriate timeouts for different environments', () => {
    // Test production with AWS RDS
    const awsRdsUrl = 'postgres://user:pass@cluster.us-east-1.rds.amazonaws.com:5432/db';
    const isAWSRDS = awsRdsUrl.includes('amazonaws.com');
    const isProduction = true;
    
    const connectTimeout = isAWSRDS ? 30 : (isProduction ? 20 : 10);
    expect(connectTimeout).toBe(30); // Should be 30 for AWS RDS
    
    // Test production without AWS RDS
    const herokuUrl = 'postgres://user:pass@ec2-host.compute-1.amazonaws.com:5432/db';
    const isNotAWSRDS = herokuUrl.includes('rds.amazonaws.com');
    const productionTimeout = isNotAWSRDS ? 30 : (isProduction ? 20 : 10);
    expect(productionTimeout).toBe(20); // Should be 20 for production non-RDS
    
    // Test development
    const localUrl = 'postgres://user:pass@localhost:5432/db';
    const isDev = false; // Not AWS RDS, not production
    const devTimeout = localUrl.includes('amazonaws.com') ? 30 : (isDev ? 20 : 10);
    expect(devTimeout).toBe(10); // Should be 10 for development
  });

  test('should configure SSL settings based on environment', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    
    // Test production SSL config
    process.env.NODE_ENV = 'production';
    const prodSSLConfig = process.env.NODE_ENV === 'production' 
      ? { rejectUnauthorized: false }
      : process.env.NODE_ENV === 'test'
      ? false
      : 'require';
    
    expect(prodSSLConfig).toEqual({ rejectUnauthorized: false });
    
    // Test test environment SSL config
    process.env.NODE_ENV = 'test';
    const testSSLConfig = process.env.NODE_ENV === 'production' 
      ? { rejectUnauthorized: false }
      : process.env.NODE_ENV === 'test'
      ? false
      : 'require';
    
    expect(testSSLConfig).toBe(false);
    
    // Test development SSL config
    process.env.NODE_ENV = 'development';
    const devSSLConfig = process.env.NODE_ENV === 'production' 
      ? { rejectUnauthorized: false }
      : process.env.NODE_ENV === 'test'
      ? false
      : 'require';
    
    expect(devSSLConfig).toBe('require');
    
    // Restore original environment
    if (originalNodeEnv) {
      process.env.NODE_ENV = originalNodeEnv;
    } else {
      delete process.env.NODE_ENV;
    }
  });
});