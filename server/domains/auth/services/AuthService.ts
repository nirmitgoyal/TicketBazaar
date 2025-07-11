/**
 * Auth Service
 * 
 * This service handles authentication business logic.
 */

import bcrypt from 'bcrypt';
import { IService } from '@ticketbazaar/types';
import { UserRepository } from '../repositories/UserRepository';
import { container, TOKENS } from '../../../core/DIContainer';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  whatsapp?: string;
  instagram?: string;
  country?: string;
}

export class AuthService implements IService {
  readonly name = 'AuthService';
  
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = container.get<UserRepository>(TOKENS.USER_REPOSITORY);
  }

  /**
   * Authenticate user with email and password
   */
  async login(credentials: LoginCredentials) {
    const { email, password } = credentials;

    // Find user by email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check if user has a password (OAuth users might not have one)
    if (!user.password) {
      throw new Error('Please sign in with Google');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    await this.userRepository.updateLastLogin(user.id);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Register new user
   */
  async register(credentials: RegisterCredentials) {
    const { email, password, ...userData } = credentials;

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.userRepository.createWithCredentials({
      ...userData,
      email,
      password: hashedPassword,
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Authenticate user with Google OAuth
   */
  async loginWithGoogle(googleProfile: {
    id: string;
    displayName: string;
    emails: Array<{ value: string }>;
    photos?: Array<{ value: string }>;
  }) {
    const email = googleProfile.emails[0]?.value;
    const profilePicture = googleProfile.photos?.[0]?.value;

    if (!email) {
      throw new Error('Google profile must have an email');
    }

    // Try to find existing user
    let user = await this.userRepository.findByGoogleId(googleProfile.id);
    
    if (!user) {
      // Try to find by email
      user = await this.userRepository.findByEmail(email);
      
      if (user) {
        // Link Google account to existing user
        user = await this.userRepository.update(user.id, {
          googleId: googleProfile.id,
          profilePicture,
        });
      } else {
        // Create new user
        user = await this.userRepository.createWithGoogle({
          fullName: googleProfile.displayName,
          email,
          googleId: googleProfile.id,
          profilePicture,
        });
      }
    }

    if (!user) {
      throw new Error('Failed to authenticate with Google');
    }

    // Update last login
    await this.userRepository.updateLastLogin(user.id);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Get user by ID
   */
  async getUserById(id: number) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Update user profile
   */
  async updateProfile(id: number, data: Partial<RegisterCredentials>) {
    const user = await this.userRepository.update(id, data);
    if (!user) {
      throw new Error('User not found');
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Change user password
   */
  async changePassword(id: number, currentPassword: string, newPassword: string) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    if (user.password) {
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        throw new Error('Current password is incorrect');
      }
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await this.userRepository.update(id, { password: hashedPassword });
  }
}