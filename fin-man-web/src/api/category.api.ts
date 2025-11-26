// src/app/api/category.api.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Category } from 'src/libs/core/models/category';

@Injectable({
  providedIn: 'root',
})
export class CategoryApi {
  private readonly apiUrl = 'http://localhost:3000/categories';

  constructor(private http: HttpClient) {}

  // POST /categories
  async create(dto: Category): Promise<Category> {
    return await firstValueFrom(this.http.post<Category>(this.apiUrl, dto));
  }

  // GET /categories
  async findAll(): Promise<Category[]> {
    return await firstValueFrom(this.http.get<Category[]>(this.apiUrl));
  }

  // GET /categories/:id
  async findOne(id: number): Promise<Category> {
    return await firstValueFrom(
      this.http.get<Category>(`${this.apiUrl}/${id}`)
    );
  }

  // PUT /categories/:id
  async update(dto: Category): Promise<Category> {
    return await firstValueFrom(
      this.http.put<Category>(`${this.apiUrl}/${dto.id}`, dto)
    );
  }

  // DELETE /categories/:id
  async remove(id: number): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`${this.apiUrl}/${id}`));
  }
}
