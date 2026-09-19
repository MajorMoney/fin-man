// src/app/api/transactions.api.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Transaction } from 'src/libs/core/models/transactions';
import { TransactionQuery } from 'src/libs/core/models/transaction-query';
import { getApiBaseUrl } from 'src/libs/core/utils/api-base-url';

@Injectable({
  providedIn: 'root',
})
export class TransactionsApi {
  private readonly apiUrl = `${getApiBaseUrl()}/transactions`;

  constructor(private http: HttpClient) {}

  // POST /transactions
  async create(dto: Transaction): Promise<Transaction> {
    return await firstValueFrom(this.http.post<Transaction>(this.apiUrl, dto));
  }

  // GET /transactions
  async findAll(query?: TransactionQuery): Promise<Transaction[]> {
    let params = new HttpParams();
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, String(value));
        }
      }
    }

    return await firstValueFrom(
      this.http.get<Transaction[]>(this.apiUrl, { params })
    );
  }

  // GET /transactions/:id
  async findOne(id: number): Promise<Transaction> {
    return await firstValueFrom(
      this.http.get<Transaction>(`${this.apiUrl}/${id}`)
    );
  }

  // PUT /transactions/:id
  async update(dto: Transaction): Promise<Transaction> {
    return await firstValueFrom(
      this.http.put<Transaction>(`${this.apiUrl}/${dto.id}`, dto)
    );
  }

  // DELETE /transactions/:id
  async remove(id: number): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`${this.apiUrl}/${id}`));
  }
}
