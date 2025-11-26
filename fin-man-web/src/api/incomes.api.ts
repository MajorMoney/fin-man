// src/app/api/incomes.api.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Income } from 'src/libs/core/models/incomes';

@Injectable({
  providedIn: 'root',
})
export class IncomesApi {
  private readonly apiUrl = 'http://localhost:3000/income';

  constructor(private http: HttpClient) {}

  // POST /incomes
  async create(dto: Income): Promise<Income> {
    return await firstValueFrom(this.http.post<Income>(this.apiUrl, dto));
  }

  // GET /incomes
  async findAll(): Promise<Income[]> {
    return await firstValueFrom(this.http.get<Income[]>(this.apiUrl));
  }

  // GET /incomes/:id
  async findOne(id: number): Promise<Income> {
    return await firstValueFrom(this.http.get<Income>(`${this.apiUrl}/${id}`));
  }

  // GET /incomes/user/:user
  async findByUser(user: string): Promise<Income[]> {
    return await firstValueFrom(
      this.http.get<Income[]>(`${this.apiUrl}/user/${user}`)
    );
  }

  // PUT /incomes/:id
  async update(dto: Income): Promise<Income> {
    return await firstValueFrom(
      this.http.put<Income>(`${this.apiUrl}/${dto.id}`, dto)
    );
  }

  // DELETE /incomes/:id
  async remove(id: number): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`${this.apiUrl}/${id}`));
  }
}
