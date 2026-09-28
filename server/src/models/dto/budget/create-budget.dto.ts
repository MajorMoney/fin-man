export interface CreateBudgetDto {
  category?: string | null;
  limit: number;
  icon: string;
  isOthers?: boolean;
}
