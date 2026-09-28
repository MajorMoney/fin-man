export interface AccountTransferRequest {
  id?: number;
  fromAccountId: number;
  toAccountId: number;
  amount: number;
  date: string;
  notes?: string;
}

export interface AccountTransfer {
  id: number;
  date: string;
  fromAccountId: number;
  toAccountId: number;
  fromAccount: string;
  toAccount: string;
  amount: number;
  currency: string;
  notes: string;
}
