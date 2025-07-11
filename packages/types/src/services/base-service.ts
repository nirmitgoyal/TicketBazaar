/**
 * Base service interface that all services should implement
 */

export interface IService {
  readonly name: string;
  initialize?(): Promise<void>;
  shutdown?(): Promise<void>;
}