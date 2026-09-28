import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { BudgetFormValue } from './category-budget-modal/category-budget-modal.component';
import { CategoryBudget } from 'src/libs/core/models/budget';
import { CategoryBudgetModalComponent } from './category-budget-modal/category-budget-modal.component';
import { CategoryBudgetRowComponent } from './category-budget-row/category-budget-row.component';

@Component({
  selector: 'app-category-budget-list',
  templateUrl: './category-budget-list.component.html',
  styleUrls: ['./category-budget-list.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [CategoryBudgetRowComponent, CategoryBudgetModalComponent],
})
export class CategoryBudgetListComponent {
  @Input() categories: CategoryBudget[] = [];
  @Output() saveCategory = new EventEmitter<BudgetFormValue>();
  @Output() deleteCategory = new EventEmitter<number>();

  modalOpen = false;
  editing: CategoryBudget | null = null;

  openCreate(): void {
    this.editing = null;
    this.modalOpen = true;
  }

  openEdit(category: CategoryBudget): void {
    this.editing = category;
    this.modalOpen = true;
  }

  close(): void {
    this.modalOpen = false;
    this.editing = null;
  }

  onSave(category: BudgetFormValue): void {
    this.saveCategory.emit(category);
    this.close();
  }

  onDelete(id: number): void {
    this.deleteCategory.emit(id);
    this.close();
  }
}
