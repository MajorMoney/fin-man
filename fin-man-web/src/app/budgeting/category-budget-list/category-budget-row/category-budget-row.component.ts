import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import {
  budgetBarColor,
  budgetPercent,
  CategoryBudget,
} from 'src/libs/core/models/budget';
import { BudgetIconComponent } from '../budget-icon/budget-icon.component';

@Component({
  selector: 'app-category-budget-row',
  templateUrl: './category-budget-row.component.html',
  styleUrls: ['./category-budget-row.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [CurrencyPipe, BudgetIconComponent],
  host: {
    role: 'button',
    tabindex: '0',
  },
})
export class CategoryBudgetRowComponent {
  @Input({ required: true }) category!: CategoryBudget;
  @Output() select = new EventEmitter<CategoryBudget>();

  @HostListener('click')
  onSelect(): void {
    this.select.emit(this.category);
  }

  @HostListener('keydown.enter')
  onEnter(): void {
    this.select.emit(this.category);
  }

  get percent(): number {
    return budgetPercent(this.category.spent, this.category.limit);
  }

  get barWidth(): number {
    return Math.min(this.percent, 100);
  }

  get color(): string {
    return budgetBarColor(this.percent);
  }

  get over(): boolean {
    return this.category.spent > this.category.limit;
  }
}
