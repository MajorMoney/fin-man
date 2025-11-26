import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-category-filter',
  templateUrl: './category-filter.component.html',
  styleUrls: ['./category-filter.component.css'],
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
