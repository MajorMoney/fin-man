import { Injectable, signal } from '@angular/core';
import { IncidentsApi } from 'src/api/incidents.api';
import { reportCaughtError } from 'src/libs/core/http/report-caught-error';
import { Incident } from 'src/libs/core/models/incidents';
import { ToastService } from 'src/services/toast.service';

@Injectable({ providedIn: 'root' })
export class IncidentsService {
  private readonly openItems = signal<Incident[]>([]);
  readonly open = this.openItems.asReadonly();

  constructor(
    private incidentsApi: IncidentsApi,
    private toast: ToastService
  ) {}

  async refreshOpen(): Promise<Incident[]> {
    try {
      const open = await this.incidentsApi.findAll('open');
      this.openItems.set(open);
      return open;
    } catch (error) {
      reportCaughtError(this.toast, error, 'Failed to load incidents');
      return this.openItems();
    }
  }

  async resolve(id: number): Promise<void> {
    await this.incidentsApi.update(id, { status: 'resolved' });
    await this.refreshOpen();
  }
}
