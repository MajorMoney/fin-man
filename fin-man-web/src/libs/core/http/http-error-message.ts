import { HttpErrorResponse } from '@angular/common/http';

export function httpErrorMessage(error: HttpErrorResponse): string {
  const body = error.error;

  if (typeof body === 'string' && body.trim()) {
    return body.trim();
  }

  if (body && typeof body === 'object') {
    const message = (body as { message?: unknown }).message;
    if (Array.isArray(message)) {
      const lines = message.map(String).filter((line) => line.trim());
      if (lines.length) return lines.join('\n');
    }
    if (typeof message === 'string' && message.trim()) {
      return message.trim();
    }

    const fieldErrors = (body as { errors?: Record<string, { message?: string }> })
      .errors;
    if (fieldErrors) {
      const lines = Object.values(fieldErrors)
        .map((entry) => entry?.message)
        .filter((line): line is string => !!line?.trim());
      if (lines.length) return lines.join('\n');
    }
  }

  if (error.status === 0) {
    return 'Could not reach the server.';
  }

  return 'Something went wrong.';
}
