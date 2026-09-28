export type SortDirection = 'asc' | 'desc' | null;

export interface SortState<Column extends string> {
  column: Column | null;
  direction: SortDirection;
}

export class ListViewUtils {
  static nextSortState<Column extends string>(
    state: SortState<Column>,
    column: Column
  ): SortState<Column> {
    if (state.column === column) {
      if (state.direction === 'asc') {
        return { column, direction: 'desc' };
      }
      if (state.direction === 'desc') {
        return { column: null, direction: null };
      }
    }

    return { column, direction: 'asc' };
  }

  static sortIcon<Column extends string>(
    state: SortState<Column>,
    column: Column
  ): string {
    if (state.column !== column || state.direction == null) {
      return '⇅';
    }
    return state.direction === 'asc' ? '↑' : '↓';
  }

  static sortByColumn<T extends object>(
    items: T[],
    column: string | null,
    direction: SortDirection,
    resolveValue?: (item: T, column: string) => unknown
  ): void {
    if (!column || !direction) {
      return;
    }

    items.sort((a, b) => {
      const aValue = this.normalizeSortValue(
        column,
        resolveValue ? resolveValue(a, column) : this.readValue(a, column)
      );
      const bValue = this.normalizeSortValue(
        column,
        resolveValue ? resolveValue(b, column) : this.readValue(b, column)
      );
      const comparison = aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      return direction === 'asc' ? comparison : -comparison;
    });
  }

  static totalPages(totalItems: number, itemsPerPage: number): number {
    return Math.ceil(totalItems / itemsPerPage) || 1;
  }

  static pageSlice<T>(
    items: T[],
    currentPage: number,
    itemsPerPage: number
  ): T[] {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return items.slice(startIndex, startIndex + itemsPerPage);
  }

  static pageNumbers(
    currentPage: number,
    totalPages: number,
    maxPagesToShow = 5
  ): number[] {
    const pages: number[] = [];

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    if (currentPage <= 3) {
      endPage = maxPagesToShow;
    } else if (currentPage >= totalPages - 2) {
      startPage = totalPages - maxPagesToShow + 1;
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  static canGoToPage(page: number, totalPages: number): boolean {
    return page >= 1 && page <= totalPages;
  }

  static itemsPerPageFromChange(event: Event): number | null {
    const value = +(event.target as HTMLSelectElement).value;
    return value > 0 ? value : null;
  }

  private static readValue(item: object, column: string): unknown {
    return (item as Record<string, unknown>)[column];
  }

  private static normalizeSortValue(
    column: string,
    value: unknown
  ): string | number {
    if (value == null) {
      return '';
    }
    if (column === 'date') {
      return new Date(String(value)).getTime();
    }
    if (column === 'amount') {
      return Number(value);
    }
    if (typeof value === 'number') {
      return value;
    }
    return String(value).toLowerCase();
  }
}
