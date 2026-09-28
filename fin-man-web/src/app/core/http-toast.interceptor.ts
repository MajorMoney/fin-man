import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, tap, throwError } from 'rxjs';
import { httpErrorMessage } from 'src/libs/core/http/http-error-message';
import { httpSuccessMessage } from 'src/libs/core/http/http-success-message';
import { ToastService } from 'src/services/toast.service';

export const httpToastInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);

  return next(req).pipe(
    tap((event) => {
      if (!(event instanceof HttpResponse)) return;
      const message = httpSuccessMessage(req.method);
      if (message) toast.success(message);
    }),
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        toast.error(httpErrorMessage(error));
      }
      return throwError(() => error);
    })
  );
};
