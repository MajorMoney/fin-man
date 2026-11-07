export interface CreateVirtualTransactionDto {
  amount: number;
  date: string;
  note?: string | null;
  /** The caller's calendar day, so "today" does not depend on server time zone. */
  today?: string;
}

export interface UpdateVirtualTransactionDto {
  amount?: number;
  date?: string;
  note?: string | null;
  today?: string;
}
