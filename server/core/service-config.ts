/**
 * Service Configuration
 * 
 * This module configures and registers all services in the DI container.
 */

import { db } from '../db';
import { container, TOKENS } from './DIContainer';

// Repositories
import { UserRepository } from '../domains/auth/repositories/UserRepository';

// Services
import { AuthService } from '../domains/auth/services/AuthService';

// Controllers
import { AuthController } from '../domains/auth/controllers/AuthController';

/**
 * Configure all services and register them in the DI container
 */
export function configureServices(): void {
  // Register database
  container.singleton(TOKENS.DATABASE, db);

  // Register repositories
  container.factory(TOKENS.USER_REPOSITORY, () => new UserRepository(db));

  // Register services
  container.factory(TOKENS.AUTH_SERVICE, () => new AuthService());

  // Register controllers
  container.factory(TOKENS.AUTH_CONTROLLER, () => new AuthController());

  console.log('[Services] All services registered successfully');
}

/**
 * Initialize all services
 */
export async function initializeServices(): Promise<void> {
  try {
    await container.initialize();
    console.log('[Services] All services initialized successfully');
  } catch (error) {
    console.error('[Services] Failed to initialize services:', error);
    throw error;
  }
}

/**
 * Shutdown all services
 */
export async function shutdownServices(): Promise<void> {
  try {
    await container.shutdown();
    console.log('[Services] All services shut down successfully');
  } catch (error) {
    console.error('[Services] Failed to shutdown services:', error);
    throw error;
  }
}