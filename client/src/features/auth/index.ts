/**
 * Authentication Feature - Index
 * 
 * This file exports all authentication-related components, hooks, and services
 * following the feature-driven architecture pattern.
 */

// Pages
export { default as LoginPage } from './pages/LoginPage';
export { default as RegisterPage } from './pages/RegisterPage';
export { default as CompleteProfilePage } from './pages/CompleteProfilePage';

// Components
export { default as LoginForm } from './components/LoginForm';
export { default as RegisterForm } from './components/RegisterForm';
export { default as AuthGuard } from './components/AuthGuard';
export { default as GoogleAuthButton } from './components/GoogleAuthButton';

// Hooks
export { useAuth } from './hooks/useAuth';
export { useAuthGuard } from './hooks/useAuthGuard';

// Services
export { AuthService } from './services/AuthService';

// Types
export type { AuthState, LoginCredentials, RegisterCredentials } from './types/auth.types';