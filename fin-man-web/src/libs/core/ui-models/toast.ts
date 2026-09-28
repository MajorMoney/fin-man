export type ToastLevel = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: number;
  level: ToastLevel;
  message: string;
}
