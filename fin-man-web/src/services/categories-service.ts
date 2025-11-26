import { Injectable, OnDestroy } from '@angular/core';
import { Category } from 'src/libs/core/models/category';
import { CategoryApi } from 'src/api/category.api';
import {
  BehaviorSubject,
  distinctUntilChanged,
  Observable,
  Subject,
} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CategoryService implements OnDestroy {
  constructor(private categoryApi: CategoryApi) {
    this.initializeCategories();
  }

  private readonly categoriesSubject = new BehaviorSubject<Category[]>([]);
  public readonly categories$: Observable<Category[]> = this.categoriesSubject
    .asObservable()
    .pipe(
      distinctUntilChanged(
        (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)
      )
    );

  get categories(): Category[] {
    return this.categoriesSubject.value;
  }

  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);
  private readonly destroy$ = new Subject<void>();

  public readonly loading$: Observable<boolean> =
    this.loadingSubject.asObservable();
  public readonly error$: Observable<string | null> =
    this.errorSubject.asObservable();

  get isLoading(): boolean {
    return this.loadingSubject.value;
  }

  get error(): string | null {
    return this.errorSubject.value;
  }

  private async initializeCategories(): Promise<void> {
    try {
      this.loadingSubject.next(true);
      this.errorSubject.next(null);

      const categoriesData = await this.categoryApi.findAll();

      if (!Array.isArray(categoriesData)) {
        throw new Error('Invalid category data format: expected an array');
      }

      const validCategories = categoriesData.filter((c) =>
        this.isValidCategory(c)
      );

      this.categoriesSubject.next(validCategories);
      this.loadingSubject.next(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to load categories';
      console.error('[CategoryService] Initialization error:', errorMessage);
      this.errorSubject.next(errorMessage);
      this.categoriesSubject.next([]);
      this.loadingSubject.next(false);
    }
  }

  /**
   * Validate category object structure
   */
  private isValidCategory(category: any): boolean {
    return (
      category !== null &&
      typeof category === 'object' &&
      'id' in category &&
      'name' in category &&
      'type' in category &&
      typeof category.id === 'number' &&
      typeof category.name === 'string' &&
      category.name.trim().length > 0 &&
      typeof category.type === 'string' &&
      category.type.trim().length > 0
    );
  }

  /**
   * Set the current list of categories
   */
  setCategories(categories: Category[]): void {
    if (!Array.isArray(categories)) {
      console.warn(
        '[CategoryService] Attempted to set invalid categories array'
      );
      this.errorSubject.next('Invalid categories array');
      return;
    }

    const validCategories = categories.filter((c) => this.isValidCategory(c));

    if (validCategories.length === 0) {
      console.error('[CategoryService] No valid categories to set');
      this.errorSubject.next('No valid categories found');
      this.categoriesSubject.next([]);
      return;
    }

    console.log('[CategoryService] Categories updated:', validCategories);
    this.categoriesSubject.next(validCategories);
    this.errorSubject.next(null);
  }

  refreshCategories(): void {
    this.initializeCategories();
  }

  /**
   * Cleanup on service destruction
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.categoriesSubject.complete();
    this.loadingSubject.complete();
    this.errorSubject.complete();
  }

  static filterByType(
    categories: Category[],
    type: 'expense' | 'income'
  ): Category[] {
    if (!Array.isArray(categories)) {
      console.warn(
        '[CategoryService] filterByType received invalid categories array'
      );
      return [];
    }

    return categories.filter((c) => c.type === type);
  }

  static exists(categories: Category[], name: string): boolean {
    return categories.some(
      (cat) => cat.name.toLowerCase() === name.toLowerCase()
    );
  }

  // CRUD operations
  async addCategory(category: Category): Promise<void> {
    await this.categoryApi.create(category);
    this.refreshCategories();
  }

  async updateCategory(category: Category): Promise<void> {
    await this.categoryApi.update(category);
    this.refreshCategories();
  }

  async deleteCategory(id: number): Promise<void> {
    await this.categoryApi.remove(id);
    this.refreshCategories();
  }
}
