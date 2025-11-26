// src/app/api/account.api.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Account } from 'src/libs/core/models/accounts';

@Injectable({
  providedIn: 'root',
})
export class AccountsApi {
  private readonly apiUrl = 'http://localhost:3000/accounts';

  constructor(private http: HttpClient) {}

  // POST /accounts
  async create(dto: Account): Promise<Account> {
    const payload = {
      ...dto,
      holders: dto.holders.map((h) => h), // or h.id
    };

    return await firstValueFrom(this.http.post<Account>(this.apiUrl, payload));
  }

  // GET /accounts
  async findAll(): Promise<Account[]> {
    return await firstValueFrom(this.http.get<Account[]>(this.apiUrl));
  }

  // GET /accounts/:id
  async findOne(id: number): Promise<Account> {
    return await firstValueFrom(this.http.get<Account>(`${this.apiUrl}/${id}`));
  }

  // PUT /accounts/:id
  async update(dto: Account): Promise<Account> {
    return await firstValueFrom(
      this.http.put<Account>(`${this.apiUrl}/${dto.id}`, dto)
    );
  }

  // DELETE /accounts/:id
  async remove(id: number): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`${this.apiUrl}/${id}`));
  }

  // GET /accounts/holder/:userId
  async findByHolder(userId: number): Promise<Account[]> {
    return await firstValueFrom(
      this.http.get<Account[]>(`${this.apiUrl}/holder/${userId}`)
    );
  }
}
