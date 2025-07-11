/**
 * @ticketbazaar/types - Shared TypeScript types for TicketBazaar platform
 * 
 * This package contains all shared types, interfaces, and utilities used across
 * the frontend and backend of the TicketBazaar application.
 */

// Core Domain Types
export * from './core/branded-types';
export * from './core/api-types';
export * from './core/error-types';
export * from './core/status-types';

// Entity Types
export * from './entities/user';
export * from './entities/ticket';
export * from './entities/event';
export * from './entities/transaction';

// Service Interfaces
export * from './services/base-service';
export * from './services/cache-service';
export * from './services/email-service';
export * from './services/notification-service';

// UI/Component Types
export * from './ui/component-props';
export * from './ui/form-types';

// Utility Types
export * from './utils/type-guards';
export * from './utils/type-helpers';
export * from './utils/validation-schemas';

// WebSocket Types
export * from './websocket/event-types';