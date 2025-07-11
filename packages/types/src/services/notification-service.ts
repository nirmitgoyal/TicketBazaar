/**
 * Notification service interface
 */

import { IService } from './base-service';
import { UserId } from '../core/branded-types';

export interface INotificationService extends IService {
  send(userId: UserId, title: string, message: string, data?: any): Promise<boolean>;
  sendToMultiple(userIds: UserId[], title: string, message: string, data?: any): Promise<boolean>;
  broadcast(title: string, message: string, data?: any): Promise<boolean>;
}