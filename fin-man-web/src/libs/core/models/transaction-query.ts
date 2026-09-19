import { TransactionType } from './transactions';

/** Query params for GET /transactions — mirrors server QueryTransactionDto */
export interface TransactionQuery {
  user?: string;
  type?: TransactionType;
  account?: string;
  category?: string;
  from?: string;
  to?: string;
  minAmount?: number;
  maxAmount?: number;
  q?: string;
  page?: number;
  limit?: number;
  sort?: string;
}
