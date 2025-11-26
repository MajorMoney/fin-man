// src/app/api/expenses.api.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Expense } from 'src/libs/core/models/expenses';

@Injectable({
  providedIn: 'root',
})
export class ExpensesApi {
  private readonly apiUrl = 'http://localhost:3000/expenses';

  constructor(private http: HttpClient) {}

  // POST /expenses
  async create(dto: Expense): Promise<Expense> {
    return await firstValueFrom(this.http.post<Expense>(this.apiUrl, dto));
  }

  // GET /expenses
  async findAll(): Promise<Expense[]> {
    return await firstValueFrom(this.http.get<Expense[]>(this.apiUrl));
  }

  // GET /expenses/:id
  async findOne(id: number): Promise<Expense> {
    return await firstValueFrom(this.http.get<Expense>(`${this.apiUrl}/${id}`));
  }

  // GET /expenses/user/:user
  async findByUser(user: string): Promise<Expense[]> {
    return await firstValueFrom(
      this.http.get<Expense[]>(`${this.apiUrl}/user/${user}`)
    );
  }

  // PUT /expenses/:id
  async update(dto: Expense): Promise<Expense> {
    return await firstValueFrom(
      this.http.put<Expense>(`${this.apiUrl}/${dto.id}`, dto)
    );
  }

  // DELETE /expenses/:id
  async remove(id: number): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`${this.apiUrl}/${id}`));
  }
}
