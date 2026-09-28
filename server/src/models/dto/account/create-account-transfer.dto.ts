export interface CreateAccountTransferDto {
  fromAccountId: number;
  toAccountId: number;
  fromAccount: string;
  toAccount: string;
  amount: number;
  date: string;
  notes?: string;
  currency: string;
}
