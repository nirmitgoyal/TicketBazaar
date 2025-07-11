/**
 * Utility type helpers
 */

// Type inference utilities
export type InferInsert<T> = T extends { $inferInsert: infer I } ? I : never;
export type InferSelect<T> = T extends { $inferSelect: infer S } ? S : never;

// Utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type MaybePromise<T> = T | Promise<T>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Database query helpers
export type WhereCondition<T> = Partial<T>;
export type OrderByCondition = { column: string; direction: 'asc' | 'desc' };