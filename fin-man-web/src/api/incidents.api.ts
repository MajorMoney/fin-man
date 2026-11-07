import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Incident, IncidentStatus } from 'src/libs/core/models/incidents';
import { getApiBaseUrl } from 'src/libs/core/utils/api-base-url';

@Injectable({
  providedIn: 'root',
})
export class IncidentsApi {
  private readonly apiUrl = `${getApiBaseUrl()}/incidents`;

  constructor(private http: HttpClient) {}

  async create(dto: Partial<Incident>): Promise<Incident> {
    return await firstValueFrom(this.http.post<Incident>(this.apiUrl, dto));
  }

  async findAll(status?: IncidentStatus): Promise<Incident[]> {
    const options = status ? { params: { status } } : {};
    return await firstValueFrom(
      this.http.get<Incident[]>(this.apiUrl, options)
    );
  }

  async findOne(id: number): Promise<Incident> {
    return await firstValueFrom(
      this.http.get<Incident>(`${this.apiUrl}/${id}`)
    );
  }

  async update(id: number, dto: Partial<Incident>): Promise<Incident> {
    return await firstValueFrom(
      this.http.put<Incident>(`${this.apiUrl}/${id}`, dto)
    );
  }

  async remove(id: number): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`${this.apiUrl}/${id}`));
  }
}
