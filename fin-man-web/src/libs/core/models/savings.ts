/** A savings goal. It is not an account and is not linked to one. Amounts are EUR. */
export interface SavingsGoal {
  id: number;
  name: string;
  description: string;
  targetAmount: number;
  /** Calendar date, YYYY-MM-DD. */
  targetDate: string;
  /** Calendar date the goal was created, YYYY-MM-DD. */
  createdOn: string;
  /** Target amount when the goal was created. The pace line never changes. */
  paceTargetAmount: number;
  /** Target date when the goal was created. The pace line never changes. */
  paceTargetDate: string;
  /** Sum of the virtual transactions still in the history. */
  savedAmount: number;
  currency: 'EUR';
}

export interface SavingsGoalInput {
  name: string;
  description: string;
  targetAmount: number;
  targetDate: string;
}

export interface CreateSavingsGoalRequest extends SavingsGoalInput {
  /** Already saved at creation. Becomes the first virtual transaction. */
  savedAmount?: number;
  today: string;
}

/** Progress on a goal. Never a real transaction, never changes an account balance. */
export interface VirtualTransaction {
  id: number;
  goalId: number;
  amount: number;
  /** Calendar date, YYYY-MM-DD. */
  date: string;
  note: string;
}

export interface VirtualTransactionInput {
  amount: number;
  date: string;
  note: string;
}

export interface VirtualTransactionRequest extends VirtualTransactionInput {
  today: string;
}
