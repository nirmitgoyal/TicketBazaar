/**
 * Dependency Injection Container
 * 
 * This container manages dependencies and provides a clean way to
 * inject services into controllers and other components.
 */

import { IService } from '@ticketbazaar/types';

export class DIContainer {
  private services = new Map<string, any>();
  private factories = new Map<string, () => any>();

  /**
   * Register a singleton service
   */
  singleton<T>(token: string, instance: T): void {
    this.services.set(token, instance);
  }

  /**
   * Register a factory function for a service
   */
  factory<T>(token: string, factory: () => T): void {
    this.factories.set(token, factory);
  }

  /**
   * Get a service instance
   */
  get<T>(token: string): T {
    // Check if singleton exists
    if (this.services.has(token)) {
      return this.services.get(token);
    }

    // Check if factory exists
    if (this.factories.has(token)) {
      const factory = this.factories.get(token)!;
      const instance = factory();
      
      // Cache the instance if it's a service
      if (instance && typeof instance === 'object' && 'name' in instance) {
        this.services.set(token, instance);
      }
      
      return instance;
    }

    throw new Error(`Service not found: ${token}`);
  }

  /**
   * Check if a service is registered
   */
  has(token: string): boolean {
    return this.services.has(token) || this.factories.has(token);
  }

  /**
   * Initialize all services
   */
  async initialize(): Promise<void> {
    const services = Array.from(this.services.values());
    const initPromises = services
      .filter((service): service is IService => 
        service && typeof service === 'object' && 'initialize' in service
      )
      .map((service) => service.initialize?.());

    await Promise.all(initPromises);
  }

  /**
   * Shutdown all services
   */
  async shutdown(): Promise<void> {
    const services = Array.from(this.services.values());
    const shutdownPromises = services
      .filter((service): service is IService => 
        service && typeof service === 'object' && 'shutdown' in service
      )
      .map((service) => service.shutdown?.());

    await Promise.all(shutdownPromises);
  }
}

// Global container instance
export const container = new DIContainer();

// Service tokens
export const TOKENS = {
  // Database
  DATABASE: 'database',
  
  // Repositories
  USER_REPOSITORY: 'userRepository',
  TICKET_REPOSITORY: 'ticketRepository',
  EVENT_REPOSITORY: 'eventRepository',
  TRANSACTION_REPOSITORY: 'transactionRepository',
  
  // Services
  AUTH_SERVICE: 'authService',
  USER_SERVICE: 'userService',
  TICKET_SERVICE: 'ticketService',
  EMAIL_SERVICE: 'emailService',
  NOTIFICATION_SERVICE: 'notificationService',
  WEBSOCKET_SERVICE: 'websocketService',
  
  // Controllers
  AUTH_CONTROLLER: 'authController',
  USER_CONTROLLER: 'userController',
  TICKET_CONTROLLER: 'ticketController',
} as const;

export type ServiceToken = typeof TOKENS[keyof typeof TOKENS];