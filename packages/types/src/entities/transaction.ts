/**
 * Transaction entity types and interfaces
 */

import { TransactionId, UserId, TicketId } from '../core/branded-types';
import { TransactionStatus } from '../core/status-types';

export interface Transaction {
  id: TransactionId;
  buyerId: UserId;
  sellerId: UserId;
  ticketId: TicketId;
  quantity: number;
  totalAmount: number;
  currency: string;
  status: TransactionStatus;
  paymentMethod: string;
  paymentId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface CreateTransactionRequest {
  buyerId: UserId;
  sellerId: UserId;
  ticketId: TicketId;
  quantity: number;
  totalAmount: number;
  currency: string;
  paymentMethod: string;
  notes?: string;
}

export interface UpdateTransactionRequest {
  id: TransactionId;
  status?: TransactionStatus;
  paymentId?: string;
  notes?: string;
}