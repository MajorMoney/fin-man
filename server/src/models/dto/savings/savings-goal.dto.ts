export interface CreateSavingsGoalDto {
  name: string;
  description?: string | null;
  targetAmount: number;
  targetDate: string;
  /** Amount already saved. Becomes the first virtual transaction. */
  savedAmount?: number | null;
  /** The caller's calendar day, so "today" does not depend on server time zone. */
  today?: string;
}

export interface UpdateSavingsGoalDto {
  name?: string;
  description?: string | null;
  targetAmount?: number;
  targetDate?: string;
}
