import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { BudgetPeriod } from 'src/libs/core/models/budget';

@Component({
  selector: 'app-budget-toolbar',
  templateUrl: './budget-toolbar.component.html',
  styleUrls: ['./budget-toolbar.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class BudgetToolbarComponent {
  @Input() period: BudgetPeriod = 'monthly';
  @Input() month = '2026-01';
  @Output() periodChange = new EventEmitter<BudgetPeriod>();
  @Output() monthChange = new EventEmitter<string>();

  readonly monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  pickerOpen = false;
  viewYear = 2026;

  get monthLabel(): string {
    const [year, month] = this.month.split('-').map(Number);
    if (!year || !month) return this.month;
    return new Date(year, month - 1, 1).toLocaleDateString('en-GB', {
      month: 'long',
      year: 'numeric',
    });
  }

  @HostListener('document:click')
  closePicker(): void {
    this.pickerOpen = false;
  }

  togglePicker(event: Event): void {
    event.stopPropagation();
    if (!this.pickerOpen) {
      this.viewYear = Number(this.month.split('-')[0]) || new Date().getFullYear();
    }
    this.pickerOpen = !this.pickerOpen;
  }

  shiftYear(event: Event, delta: number): void {
    event.stopPropagation();
    this.viewYear += delta;
  }

  isSelected(index: number): boolean {
    const [year, month] = this.month.split('-').map(Number);
    return year === this.viewYear && month === index + 1;
  }

  selectMonth(event: Event, index: number): void {
    event.stopPropagation();
    const value = `${this.viewYear}-${String(index + 1).padStart(2, '0')}`;
    this.monthChange.emit(value);
    this.pickerOpen = false;
  }
}
