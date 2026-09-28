import { HttpErrorResponse } from '@angular/common/http';
import { ToastService } from 'src/services/toast.service';
import { httpErrorMessage } from './http-error-message';

/** Surfaces a caught failure without repeating a message the HTTP layer already showed. */
export function reportCaughtError(
  toast: ToastService,
  error: unknown,
  fallback: string
): string {
  if (error instanceof HttpErrorResponse) {
    return httpErrorMessage(error);
  }

  const message = error instanceof Error && error.message ? error.message : fallback;
  toast.error(message);
  return message;
}
