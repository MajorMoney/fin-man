import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, Injectable, inject } from '@angular/core';
import { ToastService } from 'src/services/toast.service';

@Injectable()
export class ToastErrorHandler implements ErrorHandler {
  private readonly toast = inject(ToastService);

  handleError(error: unknown): void {
    const cause = unwrap(error);
    console.error(cause);

    if (cause instanceof HttpErrorResponse) return;

    const message =
      cause instanceof Error && cause.message
        ? cause.message
        : 'Something went wrong.';
    this.toast.error(message);
  }
}

function unwrap(error: unknown): unknown {
  if (error && typeof error === 'object') {
    const wrapped = error as { rejection?: unknown; ngOriginalError?: unknown };
    if (wrapped.rejection !== undefined) return unwrap(wrapped.rejection);
    if (wrapped.ngOriginalError !== undefined) return unwrap(wrapped.ngOriginalError);
  }
  return error;
}
