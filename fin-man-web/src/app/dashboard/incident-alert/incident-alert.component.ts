import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { IncidentsService } from 'src/services/incidents.service';
import { ToastService } from 'src/services/toast.service';

@Component({
  selector: 'app-incident-alert',
  templateUrl: './incident-alert.component.html',
  styleUrls: ['./incident-alert.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class IncidentAlertComponent implements OnInit {
  constructor(
    protected incidentsService: IncidentsService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    void this.load();
  }

  async resolve(id: number): Promise<void> {
    await this.incidentsService.resolve(id);
  }

  private async load(): Promise<void> {
    const open = await this.incidentsService.refreshOpen();
    if (open.length === 1) {
      this.toast.warning(`${open[0].title}\n${open[0].message}`);
      return;
    }
    if (open.length > 1) {
      this.toast.warning(`${open.length} open incidents.`);
    }
  }
}
