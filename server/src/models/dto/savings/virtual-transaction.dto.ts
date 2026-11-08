export interface CreateVirtualTransactionDto {
  amount: number;
  date: string;
  note?: string | null;
  /** The caller's calendar day. The transaction cannot be dated after it. */
  today?: string;
}

export interface UpdateVirtualTransactionDto {
  amount?: number;
  date?: string;
  note?: string | null;
  today?: string;
}
