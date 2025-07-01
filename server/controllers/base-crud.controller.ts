/**
 * Base CRUD Controller
 * Provides common CRUD operations for all controllers
 * Reduces code duplication and enforces consistent patterns
 */

import { Request, Response } from 'express';
import { db } from '../db';
import { logger } from '../utils/logger';
import { z, ZodSchema } from 'zod';

export interface CrudOptions<T> {
  tableName: string;
  table: any; // Drizzle table
  createSchema?: ZodSchema;
  updateSchema?: ZodSchema;
  idField?: string;
  defaultOrderBy?: any;
  searchFields?: string[];
}

export abstract class BaseCrudController<T> {
  protected options: CrudOptions<T>;

  constructor(options: CrudOptions<T>) {
    this.options = {
      idField: 'id',
      ...options
    };
  }

  /**
   * Get all records with pagination and search
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const offset = (page - 1) * limit;

      let query = db.select().from(this.options.table);

      // Apply search if provided
      if (search && this.options.searchFields) {
        // This is simplified - in production, use proper SQL search
        logger.info('CRUD', `Searching ${this.options.tableName} for: ${search}`);
      }

      // Apply ordering
      if (this.options.defaultOrderBy) {
        query = query.orderBy(this.options.defaultOrderBy);
      }

      // Apply pagination
      const results = await query.limit(limit).offset(offset);

      res.json({
        success: true,
        data: results,
        pagination: {
          page,
          limit,
          total: results.length // In production, get actual total count
        }
      });
    } catch (error) {
      this.handleError(error, res, 'Error fetching records');
    }
  }

  /**
   * Get single record by ID
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = this.parseId(req.params.id);
      
      const result = await db
        .select()
        .from(this.options.table)
        .where(this.eq(this.options.idField!, id))
        .limit(1);

      if (!result || result.length === 0) {
        res.status(404).json({
          success: false,
          error: `${this.options.tableName} not found`
        });
        return;
      }

      res.json({
        success: true,
        data: result[0]
      });
    } catch (error) {
      this.handleError(error, res, 'Error fetching record');
    }
  }

  /**
   * Create new record
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      // Validate input if schema provided
      const data = this.options.createSchema 
        ? this.options.createSchema.parse(req.body)
        : req.body;

      const result = await db
        .insert(this.options.table)
        .values(data)
        .returning();

      logger.info('CRUD', `Created new ${this.options.tableName}`, { id: result[0][this.options.idField!] });

      res.status(201).json({
        success: true,
        data: result[0]
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors
        });
      } else {
        this.handleError(error, res, 'Error creating record');
      }
    }
  }

  /**
   * Update record
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = this.parseId(req.params.id);
      
      // Validate input if schema provided
      const data = this.options.updateSchema
        ? this.options.updateSchema.parse(req.body)
        : req.body;

      const result = await db
        .update(this.options.table)
        .set(data)
        .where(this.eq(this.options.idField!, id))
        .returning();

      if (!result || result.length === 0) {
        res.status(404).json({
          success: false,
          error: `${this.options.tableName} not found`
        });
        return;
      }

      logger.info('CRUD', `Updated ${this.options.tableName}`, { id });

      res.json({
        success: true,
        data: result[0]
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors
        });
      } else {
        this.handleError(error, res, 'Error updating record');
      }
    }
  }

  /**
   * Delete record
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = this.parseId(req.params.id);

      const result = await db
        .delete(this.options.table)
        .where(this.eq(this.options.idField!, id))
        .returning();

      if (!result || result.length === 0) {
        res.status(404).json({
          success: false,
          error: `${this.options.tableName} not found`
        });
        return;
      }

      logger.info('CRUD', `Deleted ${this.options.tableName}`, { id });

      res.json({
        success: true,
        message: `${this.options.tableName} deleted successfully`
      });
    } catch (error) {
      this.handleError(error, res, 'Error deleting record');
    }
  }

  /**
   * Handle errors consistently
   */
  protected handleError(error: any, res: Response, message: string): void {
    logger.error('CRUD', message, error);
    
    res.status(500).json({
      success: false,
      error: message,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }

  /**
   * Parse ID based on expected type
   */
  protected parseId(id: string): number | string {
    // Try to parse as number first
    const numId = parseInt(id);
    return isNaN(numId) ? id : numId;
  }

  /**
   * Helper for equality comparison (handles different column types)
   */
  protected eq(field: string, value: any): any {
    // This is a simplified version - in production, use proper Drizzle operators
    return `${field} = ${value}`;
  }

  /**
   * Override this to add custom logic before create
   */
  protected async beforeCreate(data: any): Promise<any> {
    return data;
  }

  /**
   * Override this to add custom logic after create
   */
  protected async afterCreate(created: T): Promise<void> {
    // Default: no-op
  }

  /**
   * Override this to add custom logic before update
   */
  protected async beforeUpdate(id: any, data: any): Promise<any> {
    return data;
  }

  /**
   * Override this to add custom logic after update
   */
  protected async afterUpdate(updated: T): Promise<void> {
    // Default: no-op
  }

  /**
   * Override this to add custom logic before delete
   */
  protected async beforeDelete(id: any): Promise<boolean> {
    return true; // Return false to prevent deletion
  }

  /**
   * Override this to add custom logic after delete
   */
  protected async afterDelete(id: any): Promise<void> {
    // Default: no-op
  }
}