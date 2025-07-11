/**
 * Email service interface
 */

import { IService } from './base-service';

export interface IEmailService extends IService {
  send(to: string, subject: string, content: string): Promise<boolean>;
  sendTemplate(to: string, templateId: string, data: any): Promise<boolean>;
}