// src/app/api/transactions.api.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Transaction } from 'src/libs/core/models/transactions';

@Injectable({
  providedIn: 'root',
})
export class TransactionsApi {
  private readonly apiUrl = 'http://localhost:3000/transactions';

  constructor(private http: HttpClient) {}

  // POST /transactions
  async create(dto: Transaction): Promise<Transaction> {
    return await firstValueFrom(this.http.post<Transaction>(this.apiUrl, dto));
  }

  // GET /transactions
  async findAll(): Promise<Transaction[]> {
    return await firstValueFrom(this.http.get<Transaction[]>(this.apiUrl));
  }

  // GET /transactions/:id
  async findOne(id: number): Promise<Transaction> {
    return await firstValueFrom(
      this.http.get<Transaction>(`${this.apiUrl}/${id}`)
    );
  }

  // GET /transactions/user/:user
  async findByUser(user: string): Promise<Transaction[]> {
    return await firstValueFrom(
      this.http.get<Transaction[]>(`${this.apiUrl}/user/${user}`)
    );
  }

  // GET /transactions/type/:type
  async findByType(type: 'income' | 'expense'): Promise<Transaction[]> {
    return await firstValueFrom(
      this.http.get<Transaction[]>(`${this.apiUrl}/type/${type}`)
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
