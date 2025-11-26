import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, firstValueFrom, throwError } from 'rxjs';
import type { User } from 'src/libs/core/models/users';

@Injectable({
  providedIn: 'root',
})
export class UsersApi {
  private readonly apiUrl = 'http://localhost:3000/users';

  constructor(private http: HttpClient) {}

  // POST /users
  async create(dto: User): Promise<User> {
    return await firstValueFrom(
      this.http.post<User>(this.apiUrl, dto).pipe(
        catchError((err) => {
          // Optional: parse Mongoose validation errors
          let msg = 'An unknown error occurred';
          if (err.status === 400 && err.error?.message) {
            msg = err.error.message; // usually Mongoose validation message
          } else if (err.error?.errors) {
            // Build readable string from Mongoose errors
            msg = Object.values(err.error.errors)
              .map((e: any) => e.message)
              .join('\n');
          }
          alert(msg); // Or show in a toast / snackbar
          return throwError(() => err);
        })
      )
    );
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
