import { Injectable, signal } from '@angular/core';
import { Toast, ToastLevel } from 'src/libs/core/ui-models/toast';

const DURATION_MS: Record<ToastLevel, number> = {
  success: 1000,
  info: 1000,
  warning: 1500,
  error: 2000,
};

const MAX_TOASTS = 4;

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly items = signal<Toast[]>([]);
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();
  private nextId = 0;

  readonly toasts = this.items.asReadonly();

  success(message: string): void {
    this.show('success', message);
  }

  error(message: string): void {
    this.show('error', message);
  }

  warning(message: string): void {
    this.show('warning', message);
  }

  info(message: string): void {
    this.show('info', message);
  }

  dismiss(id: number): void {
    this.clearTimer(id);
    this.items.update((toasts) => toasts.filter((toast) => toast.id !== id));
  }

  private show(level: ToastLevel, message: string): void {
    const text = message.trim();
    if (!text) return;

    const existing = this.items().find(
      (toast) => toast.level === level && toast.message === text
    );
    if (existing) {
      this.schedule(existing.id, level);
      return;
    }

    const toast: Toast = { id: ++this.nextId, level, message: text };
    this.items.update((toasts) => {
      const next = [...toasts, toast];
      next
        .slice(0, Math.max(0, next.length - MAX_TOASTS))
        .forEach((item) => this.clearTimer(item.id));
      return next.slice(-MAX_TOASTS);
    });
    this.schedule(toast.id, level);
  }

  private clearTimer(id: number): void {
    const timer = this.timers.get(id);
    if (timer) clearTimeout(timer);
    this.timers.delete(id);
  }

  private schedule(id: number, level: ToastLevel): void {
    const previous = this.timers.get(id);
    if (previous) clearTimeout(previous);
    this.timers.set(
      id,
      setTimeout(() => this.dismiss(id), DURATION_MS[level])
    );
  }
}
