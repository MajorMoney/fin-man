import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  CreateSavingsGoalRequest,
  SavingsGoal,
  SavingsGoalInput,
  VirtualTransaction,
  VirtualTransactionRequest,
} from 'src/libs/core/models/savings';
import { getApiBaseUrl } from 'src/libs/core/utils/api-base-url';

@Injectable({
  providedIn: 'root',
})
export class SavingsApi {
  private readonly apiUrl = `${getApiBaseUrl()}/savings-goals`;

  constructor(private http: HttpClient) {}

  // POST /savings-goals
  async createGoal(dto: CreateSavingsGoalRequest): Promise<SavingsGoal> {
    return await firstValueFrom(this.http.post<SavingsGoal>(this.apiUrl, dto));
  }

  // GET /savings-goals
  async findAllGoals(): Promise<SavingsGoal[]> {
    return await firstValueFrom(this.http.get<SavingsGoal[]>(this.apiUrl));
  }

  // GET /savings-goals/:id
  async findGoal(id: number): Promise<SavingsGoal> {
    return await firstValueFrom(
      this.http.get<SavingsGoal>(`${this.apiUrl}/${id}`)
    );
  }

  // PUT /savings-goals/:id
  async updateGoal(id: number, dto: SavingsGoalInput): Promise<SavingsGoal> {
    return await firstValueFrom(
      this.http.put<SavingsGoal>(`${this.apiUrl}/${id}`, dto)
    );
  }

  // DELETE /savings-goals/:id (also deletes the history)
  async removeGoal(id: number): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`${this.apiUrl}/${id}`));
  }

  // GET /savings-goals/:id/virtual-transactions (newest first)
  async findTransactions(goalId: number): Promise<VirtualTransaction[]> {
    return await firstValueFrom(
      this.http.get<VirtualTransaction[]>(
        `${this.apiUrl}/${goalId}/virtual-transactions`
      )
    );
  }

  // POST /savings-goals/:id/virtual-transactions
  async createTransaction(
    goalId: number,
    dto: VirtualTransactionRequest
  ): Promise<VirtualTransaction> {
    return await firstValueFrom(
      this.http.post<VirtualTransaction>(
        `${this.apiUrl}/${goalId}/virtual-transactions`,
        dto
      )
    );
  }

  // PUT /savings-goals/:id/virtual-transactions/:transactionId
  async updateTransaction(
    goalId: number,
    id: number,
    dto: VirtualTransactionRequest
  ): Promise<VirtualTransaction> {
    return await firstValueFrom(
      this.http.put<VirtualTransaction>(
        `${this.apiUrl}/${goalId}/virtual-transactions/${id}`,
        dto
      )
    );
  }

  // DELETE /savings-goals/:id/virtual-transactions/:transactionId
  async revertTransaction(goalId: number, id: number): Promise<void> {
    await firstValueFrom(
      this.http.delete<void>(
        `${this.apiUrl}/${goalId}/virtual-transactions/${id}`
      )
    );
  }
}
