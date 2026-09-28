export interface AccountTransferDto {
  id?: number;
  fromAccountId: number;
  toAccountId: number;
  amount: number;
  date: string;
  notes?: string;
}
