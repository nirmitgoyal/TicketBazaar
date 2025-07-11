#!/usr/bin/env node

/**
 * Architecture Demonstration Script
 * 
 * This script demonstrates the new refactored architecture with:
 * - Typed repositories
 * - Dependency injection
 * - Service layer architecture
 * - Error handling
 * - Transaction management
 */

import { configureServices, initializeServices } from '../server/core/service-config.js';
import { container, TOKENS } from '../server/core/DIContainer.js';
import { logger } from '../server/core/logger.js';

async function demonstrateArchitecture() {
  try {
    logger.info('🚀 Starting Architecture Demonstration');

    // 1. Configure and initialize services
    logger.info('📋 Configuring services...');
    configureServices();
    
    logger.info('⚡ Initializing services...');
    await initializeServices();

    // 2. Demonstrate repository pattern
    logger.info('🏗️  Demonstrating Repository Pattern');
    
    const userRepository = container.get(TOKENS.USER_REPOSITORY);
    const authService = container.get(TOKENS.AUTH_SERVICE);

    // 3. Demonstrate type-safe operations
    logger.info('🔍 Demonstrating Type-Safe Operations');
    
    // Create a test user
    const testUser = await authService.register({
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'testpassword123',
      country: 'US',
    });

    logger.info('✅ Created test user:', {
      id: testUser.id,
      email: testUser.email,
      fullName: testUser.fullName,
    });

    // 4. Demonstrate authentication
    logger.info('🔐 Demonstrating Authentication');
    
    const authenticatedUser = await authService.login({
      email: 'test@example.com',
      password: 'testpassword123',
    });

    logger.info('✅ Authenticated user:', {
      id: authenticatedUser.id,
      email: authenticatedUser.email,
      lastLogin: authenticatedUser.lastLogin,
    });

    // 5. Demonstrate repository queries
    logger.info('📊 Demonstrating Repository Queries');
    
    const userByEmail = await userRepository.findByEmail('test@example.com');
    const userCount = await userRepository.count();
    
    logger.info('✅ Repository queries:', {
      foundUser: !!userByEmail,
      totalUsers: userCount,
    });

    // 6. Demonstrate transaction
    logger.info('💾 Demonstrating Transaction Management');
    
    await userRepository.transaction(async (tx) => {
      logger.info('📝 Inside transaction - updating user trust score');
      await userRepository.updateTrustScore(testUser.id, 85.5);
      logger.info('✅ Transaction completed successfully');
    });

    // 7. Clean up
    logger.info('🧹 Cleaning up test data');
    await userRepository.delete(testUser.id);

    logger.info('🎉 Architecture demonstration completed successfully!');
    logger.info('');
    logger.info('✨ Key Features Demonstrated:');
    logger.info('   • Dependency Injection Container');
    logger.info('   • Type-Safe Repository Pattern');
    logger.info('   • Service Layer Architecture');
    logger.info('   • Transaction Management');
    logger.info('   • Centralized Error Handling');
    logger.info('   • Structured Logging');
    logger.info('   • Domain-Driven Design');
    
  } catch (error) {
    logger.error('❌ Architecture demonstration failed:', error);
    process.exit(1);
  }
}

// Run the demonstration
demonstrateArchitecture().catch((error) => {
  logger.error('💥 Fatal error:', error);
  process.exit(1);
});