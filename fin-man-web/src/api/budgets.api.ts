import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { BudgetIcon, BudgetTemplate } from 'src/libs/core/models/budget';
import { getApiBaseUrl } from 'src/libs/core/utils/api-base-url';

export interface CreateBudgetRequest {
  category: string;
  limit: number;
  icon: BudgetIcon;
}

export interface UpdateBudgetRequest {
  category?: string | null;
  limit?: number;
  icon?: BudgetIcon;
}

@Injectable({
  providedIn: 'root',
})
export class BudgetsApi {
  private readonly apiUrl = `${getApiBaseUrl()}/budgets`;

  constructor(private http: HttpClient) {}

  async create(dto: CreateBudgetRequest): Promise<BudgetTemplate> {
    return await firstValueFrom(
      this.http.post<BudgetTemplate>(this.apiUrl, dto)
    );
  }

  async findAll(): Promise<BudgetTemplate[]> {
    return await firstValueFrom(this.http.get<BudgetTemplate[]>(this.apiUrl));
  }

  async update(id: number, dto: UpdateBudgetRequest): Promise<BudgetTemplate> {
    return await firstValueFrom(
      this.http.put<BudgetTemplate>(`${this.apiUrl}/${id}`, dto)
    );
  }

  async remove(id: number): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`${this.apiUrl}/${id}`));
  }
}
