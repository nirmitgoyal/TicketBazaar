/**
 * Auth Routes
 * 
 * This file defines the authentication routes.
 */

import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { container, TOKENS } from '../../../core/DIContainer';

export function createAuthRoutes(): Router {
  const router = Router();
  const authController = container.get<AuthController>(TOKENS.AUTH_CONTROLLER);

  // Authentication routes
  router.post('/login', authController.login);
  router.post('/register', authController.register);
  router.post('/logout', authController.logout);
  router.get('/user', authController.getCurrentUser);
  router.put('/profile', authController.updateProfile);
  router.put('/password', authController.changePassword);

  return router;
}