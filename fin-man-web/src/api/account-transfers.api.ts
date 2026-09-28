import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AccountTransfer } from 'src/libs/core/models/account-transfers';
import { getApiBaseUrl } from 'src/libs/core/utils/api-base-url';

@Injectable({
  providedIn: 'root',
})
export class AccountTransfersApi {
  private readonly apiUrl = `${getApiBaseUrl()}/account-transfers`;

  constructor(private http: HttpClient) {}

  async findAll(): Promise<AccountTransfer[]> {
    return await firstValueFrom(this.http.get<AccountTransfer[]>(this.apiUrl));
  }
}
