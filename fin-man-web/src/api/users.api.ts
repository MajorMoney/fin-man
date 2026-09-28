import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { User } from 'src/libs/core/models/users';
import { getApiBaseUrl } from 'src/libs/core/utils/api-base-url';

@Injectable({
  providedIn: 'root',
})
export class UsersApi {
  private readonly apiUrl = `${getApiBaseUrl()}/users`;

  constructor(private http: HttpClient) {}

  // POST /users
  async create(dto: User): Promise<User> {
    return await firstValueFrom(this.http.post<User>(this.apiUrl, dto));
  }

  // GET /users
  async findAll(): Promise<User[]> {
    return await firstValueFrom(this.http.get<User[]>(this.apiUrl));
  }

  // GET /users/:id
  async findOne(id: string): Promise<User> {
    return await firstValueFrom(this.http.get<User>(`${this.apiUrl}/${id}`));
  }

  // PUT /users/:id
  async update(dto: User): Promise<User> {
    return await firstValueFrom(
      this.http.put<User>(`${this.apiUrl}/${dto.id}`, dto)
    );
  }

  // DELETE /users/:id
  async remove(id: number): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`${this.apiUrl}/${id}`));
  }
}
