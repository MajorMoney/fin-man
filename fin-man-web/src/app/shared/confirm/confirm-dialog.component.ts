import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ConfirmService } from 'src/services/confirm.service';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class ConfirmDialogComponent {
  private readonly confirmService = inject(ConfirmService);

  readonly request = this.confirmService.request;

  accept(): void {
    this.confirmService.accept();
  }

  cancel(): void {
    this.confirmService.cancel();
  }
}
