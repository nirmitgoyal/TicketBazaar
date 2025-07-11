/**
 * User Repository
 * 
 * This repository handles all database operations for users.
 */

import { eq, and } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { users } from '@shared/schema';
import { User } from '@ticketbazaar/types';
import { BaseRepository } from '../../core/BaseRepository';

type UserTable = typeof users;
type UserSelect = typeof users.$inferSelect;
type UserInsert = typeof users.$inferInsert;

export class UserRepository extends BaseRepository<UserTable, UserSelect, UserInsert> {
  constructor(db: NodePgDatabase) {
    super(db, users);
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<UserSelect | null> {
    return this.findOne({ email });
  }

  /**
   * Find user by Google ID
   */
  async findByGoogleId(googleId: string): Promise<UserSelect | null> {
    return this.findOne({ googleId });
  }

  /**
   * Create user with email and password
   */
  async createWithCredentials(data: {
    fullName: string;
    email: string;
    password: string;
    phone?: string;
    whatsapp?: string;
    instagram?: string;
    country?: string;
  }): Promise<UserSelect> {
    return this.create({
      ...data,
      emailVerified: false,
      phoneVerified: false,
      governmentIdVerified: false,
      isAdmin: false,
      trustScore: 0,
      verificationLevel: 0,
      responseRate: 0,
      avgResponseTime: 0,
      verificationStatus: 'unverified',
      preferredContactMethod: 'email',
      timezone: 'UTC',
      language: 'en',
      accountFlags: '{}',
    });
  }

  /**
   * Create user with Google OAuth
   */
  async createWithGoogle(data: {
    fullName: string;
    email: string;
    googleId: string;
    profilePicture?: string;
  }): Promise<UserSelect> {
    return this.create({
      ...data,
      emailVerified: true, // Google accounts have verified email
      phoneVerified: false,
      governmentIdVerified: false,
      isAdmin: false,
      trustScore: 0,
      verificationLevel: 0,
      responseRate: 0,
      avgResponseTime: 0,
      verificationStatus: 'unverified',
      preferredContactMethod: 'email',
      country: 'US',
      timezone: 'UTC',
      language: 'en',
      accountFlags: '{}',
    });
  }

  /**
   * Update user's last login
   */
  async updateLastLogin(id: number): Promise<void> {
    await this.update(id, { lastLogin: new Date() });
  }

  /**
   * Update user's trust score
   */
  async updateTrustScore(id: number, trustScore: number): Promise<UserSelect | null> {
    return this.update(id, { trustScore });
  }

  /**
   * Verify user's email
   */
  async verifyEmail(id: number): Promise<UserSelect | null> {
    return this.update(id, { emailVerified: true });
  }

  /**
   * Verify user's phone
   */
  async verifyPhone(id: number): Promise<UserSelect | null> {
    return this.update(id, { phoneVerified: true });
  }

  /**
   * Find users by verification status
   */
  async findByVerificationStatus(status: string): Promise<UserSelect[]> {
    return this.findMany({ verificationStatus: status });
  }

  /**
   * Search users by name or email
   */
  async search(query: string, limit = 10): Promise<UserSelect[]> {
    return this.db
      .select()
      .from(users)
      .where(
        and(
          eq(users.fullName, query),
          eq(users.email, query)
        )
      )
      .limit(limit);
  }
}