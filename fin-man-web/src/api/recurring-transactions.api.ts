// src/app/api/recurring-transactions.api.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { RecurringTransaction } from 'src/libs/core/models/recurring-transaction';
@Injectable({
  providedIn: 'root',
})
export class RecurringTransactionsApi {
  private readonly apiUrl = 'http://localhost:3000/recurring-transactions';

  constructor(private http: HttpClient) {}

  // POST /recurring-transactions
  async create(dto: RecurringTransaction): Promise<RecurringTransaction>  {
    return await firstValueFrom(
      this.http.post<RecurringTransaction>(this.apiUrl, dto)
    );
  }

  // GET /recurring-transactions
  async findAll(): Promise<RecurringTransaction[]> {
    return await firstValueFrom(
      this.http.get<RecurringTransaction[]>(this.apiUrl)
    );
  }

  // GET /recurring-transactions/:id
  async findOne(id: number): Promise<RecurringTransaction> {
    return await firstValueFrom(
      this.http.get<RecurringTransaction>(`${this.apiUrl}/${id}`)
    );
  }

  // GET /recurring-transactions/user/:user
  async findByUser(user: string): Promise<RecurringTransaction[]> {
    return await firstValueFrom(
      this.http.get<RecurringTransaction[]>(`${this.apiUrl}/user/${user}`)
    );
  }

  // GET /recurring-transactions/type/:type
  async findByType(
    type: 'income' | 'expense'
  ): Promise<RecurringTransaction[]> {
    return await firstValueFrom(
      this.http.get<RecurringTransaction[]>(`${this.apiUrl}/type/${type}`)
    );
  }

  // PUT /recurring-transactions/:id
  async update(dto: RecurringTransaction): Promise<RecurringTransaction> {
    return await firstValueFrom(
      this.http.put<RecurringTransaction>(`${this.apiUrl}/${dto.id}`, dto)
    );
  }

  // DELETE /recurring-transactions/:id
  async remove(id: number): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`${this.apiUrl}/${id}`));
  }
}
