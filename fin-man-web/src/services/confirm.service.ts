import { Injectable, signal } from '@angular/core';

export interface ConfirmRequest {
  title: string;
  message: string;
  confirmLabel: string;
  danger: boolean;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private readonly current = signal<ConfirmRequest | null>(null);
  private resolve: ((accepted: boolean) => void) | null = null;

  readonly request = this.current.asReadonly();

  confirm(request: ConfirmRequest): Promise<boolean> {
    this.finish(false);
    return new Promise((resolve) => {
      this.resolve = resolve;
      this.current.set(request);
    });
  }

  accept(): void {
    this.finish(true);
  }

  cancel(): void {
    this.finish(false);
  }

  private finish(accepted: boolean): void {
    const resolve = this.resolve;
    this.resolve = null;
    this.current.set(null);
    resolve?.(accepted);
  }
}
