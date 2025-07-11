/**
 * Base Repository
 * 
 * This abstract class provides common database operations for all repositories.
 * It uses Drizzle ORM for type-safe database queries.
 */

import { eq, SQL } from 'drizzle-orm';
import { PgTable } from 'drizzle-orm/pg-core';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { WhereCondition, OrderByCondition } from '@ticketbazaar/types';

export abstract class BaseRepository<T extends PgTable, SelectType, InsertType> {
  constructor(
    protected db: NodePgDatabase,
    protected table: T
  ) {}

  /**
   * Find by ID
   */
  async findById(id: number): Promise<SelectType | null> {
    const result = await this.db
      .select()
      .from(this.table)
      .where(eq(this.table.id, id))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Find one by condition
   */
  async findOne(where: WhereCondition<SelectType>): Promise<SelectType | null> {
    const result = await this.db
      .select()
      .from(this.table)
      .where(this.buildWhereCondition(where))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Find many by condition
   */
  async findMany(
    where?: WhereCondition<SelectType>,
    orderBy?: OrderByCondition,
    limit?: number,
    offset?: number
  ): Promise<SelectType[]> {
    let query = this.db.select().from(this.table);

    if (where) {
      query = query.where(this.buildWhereCondition(where));
    }

    if (orderBy) {
      query = query.orderBy(this.buildOrderByCondition(orderBy));
    }

    if (limit) {
      query = query.limit(limit);
    }

    if (offset) {
      query = query.offset(offset);
    }

    return query;
  }

  /**
   * Count records
   */
  async count(where?: WhereCondition<SelectType>): Promise<number> {
    let query = this.db.select({ count: this.db.count() }).from(this.table);

    if (where) {
      query = query.where(this.buildWhereCondition(where));
    }

    const result = await query;
    return result[0]?.count || 0;
  }

  /**
   * Create new record
   */
  async create(data: InsertType): Promise<SelectType> {
    const result = await this.db
      .insert(this.table)
      .values(data)
      .returning();

    return result[0];
  }

  /**
   * Update record by ID
   */
  async update(id: number, data: Partial<InsertType>): Promise<SelectType | null> {
    const result = await this.db
      .update(this.table)
      .set(data)
      .where(eq(this.table.id, id))
      .returning();

    return result[0] || null;
  }

  /**
   * Delete record by ID
   */
  async delete(id: number): Promise<boolean> {
    const result = await this.db
      .delete(this.table)
      .where(eq(this.table.id, id))
      .returning();

    return result.length > 0;
  }

  /**
   * Execute within transaction
   */
  async transaction<R>(
    callback: (tx: NodePgDatabase) => Promise<R>
  ): Promise<R> {
    return this.db.transaction(callback);
  }

  /**
   * Build WHERE condition
   */
  protected buildWhereCondition(where: WhereCondition<SelectType>): SQL {
    if (typeof where === 'object' && where !== null) {
      const conditions: SQL[] = [];
      
      for (const [key, value] of Object.entries(where)) {
        if (value !== undefined) {
          conditions.push(eq(this.table[key], value));
        }
      }
      
      if (conditions.length === 0) {
        return undefined as any;
      }
      
      return conditions.length === 1 
        ? conditions[0] 
        : conditions.reduce((acc, curr) => acc.and(curr));
    }
    
    return where as SQL;
  }

  /**
   * Build ORDER BY condition
   */
  protected buildOrderByCondition(orderBy: OrderByCondition): SQL {
    if (typeof orderBy === 'object' && 'column' in orderBy) {
      const column = this.table[orderBy.column];
      return orderBy.direction === 'desc' ? column.desc() : column.asc();
    }
    
    return orderBy as SQL;
  }
}