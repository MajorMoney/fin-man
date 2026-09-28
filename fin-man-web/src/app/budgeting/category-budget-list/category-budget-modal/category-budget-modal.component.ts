import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Category } from 'src/libs/core/models/category';
import { BudgetIcon, CategoryBudget } from 'src/libs/core/models/budget';
import { CategoryService } from 'src/services/categories-service';
import { ConfirmService } from 'src/services/confirm.service';
import { ToastService } from 'src/services/toast.service';

export interface BudgetFormValue {
  id?: number;
  name: string;
  limit: number;
  icon: BudgetIcon;
  isOthers: boolean;
}

@Component({
  selector: 'app-category-budget-modal',
  templateUrl: './category-budget-modal.component.html',
  styleUrls: ['./category-budget-modal.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FormsModule],
})
export class CategoryBudgetModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() budget: CategoryBudget | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() save = new EventEmitter<BudgetFormValue>();
  @Output() delete = new EventEmitter<number>();

  readonly icons: BudgetIcon[] = [
    'home',
    'cart',
    'car',
    'utensils',
    'heart',
    'film',
    'refresh',
    'shirt',
    'bag',
  ];

  name = '';
  limit: number | null = null;
  icon: BudgetIcon = 'cart';
  categories: Category[] = [];
  filteredCategoryOptions: Category[] = [];

  constructor(
    private categoryService: CategoryService,
    private confirmService: ConfirmService,
    private toast: ToastService
  ) {
    this.categoryService.categories$
      .pipe(takeUntilDestroyed())
      .subscribe((categories) => {
        this.categories = categories;
      });
  }

  get editing(): boolean {
    return this.budget != null;
  }

  get isOthers(): boolean {
    return this.budget?.isOthers === true;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']?.currentValue || changes['budget']) this.fill();
  }

  onClose(): void {
    this.filteredCategoryOptions = [];
    this.closeModal.emit();
  }

  onContentClick(event: Event): void {
    event.stopPropagation();
  }

  filterCategories(): void {
    const input = this.name.trim().toLowerCase();
    this.filteredCategoryOptions = this.categories
      .filter((category) => category.name.toLowerCase() !== 'others')
      .filter((category) => category.name.toLowerCase().includes(input))
      .slice(0, 10);
  }

  selectCategory(name: string): void {
    this.name = name;
    this.filteredCategoryOptions = [];
  }

  async onCategoryBlur(): Promise<void> {
    const input = this.name.trim();
    if (!input || input.toLowerCase() === 'others') {
      this.filteredCategoryOptions = [];
      return;
    }
    if (CategoryService.exists(this.categories, input)) {
      this.filteredCategoryOptions = [];
      return;
    }
    const create = await this.confirmService.confirm({
      title: 'Create category',
      message: `You selected a category that doesn't exist. Do you want to create category '${input}'?`,
      confirmLabel: 'Create',
      danger: false,
    });
    if (create) {
      try {
        await this.categoryService.addCategory({
          id: 0,
          name: input,
          type: 'expense',
        });
      } catch {
        this.name = '';
      }
    } else {
      this.name = '';
    }
    this.filteredCategoryOptions = [];
  }

  onSave(): void {
    const errors: string[] = [];
    if (!this.isOthers && !this.name.trim()) errors.push('Name is required.');
    if (!this.isOthers && this.name.trim().toLowerCase() === 'others') {
      errors.push('Others is reserved.');
    }
    if (this.limit == null || isNaN(this.limit) || this.limit <= 0) {
      errors.push('Limit must be greater than 0.');
    } else if (!/^\d+(\.\d{1,2})?$/.test(String(this.limit))) {
      errors.push('Limit cannot have more than 2 decimal places.');
    }
    if (errors.length) {
      this.toast.warning(errors.join('\n'));
      return;
    }
    this.save.emit({
      id: this.budget?.id,
      name: this.isOthers ? 'Others' : this.name.trim(),
      limit: this.limit as number,
      icon: this.icon,
      isOthers: this.isOthers,
    });
  }

  async onDelete(): Promise<void> {
    if (!this.budget || this.isOthers) return;
    const accepted = await this.confirmService.confirm({
      title: 'Delete budget',
      message: `Delete budget "${this.budget.name}"?`,
      confirmLabel: 'Delete',
      danger: true,
    });
    if (accepted) this.delete.emit(this.budget.id);
  }

  private fill(): void {
    if (!this.isOpen) return;
    this.filteredCategoryOptions = [];
    if (!this.budget) {
      this.name = '';
      this.limit = null;
      this.icon = 'cart';
      return;
    }
    this.name = this.budget.name;
    this.limit = this.budget.monthlyLimit;
    this.icon = this.budget.icon;
  }
}
