import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-category-filter',
    templateUrl: './category-filter.component.html',
    styleUrls: ['./category-filter.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormsModule]
})
export class CategoryFilterComponent {
  @Input() categories: string[] = [];
  @Input() selectedCategory: string = 'All';
  @Output() categoryChange = new EventEmitter<string>();

  onSelectChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.categoryChange.emit(target.value);
  }
}
