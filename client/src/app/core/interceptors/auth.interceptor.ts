import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, catchError, switchMap, take, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

// single-flight: if multiple requests get 401 at once, refresh only once
// the others wait for it to finish and then retry
let isRefreshing = false;
const refreshDone$ = new Subject<void>();

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const shouldRefresh =
        err.status === 401 && req.url.startsWith(environment.apiUrl) && !req.url.includes('/auth/'); // never refresh on login/register/logout/refresh itself

      if (!shouldRefresh) return throwError(() => err);

      // wait for refresh and then retry request
      if (isRefreshing) {
        return refreshDone$.pipe(
          take(1),
          switchMap(() => next(req)),
        );
      }

      isRefreshing = true;
      return auth.refresh().pipe(
        switchMap(() => {
          isRefreshing = false;
          refreshDone$.next(); // wake the waiters
          return next(req); // retry the original request
        }),
        catchError((refreshErr) => {
          isRefreshing = false;
          refreshDone$.next(); // wake the waiters too, so they don't hang
          auth.clearSession();
          void router.navigate(['/auth']);
          return throwError(() => refreshErr);
        }),
      );
    }),
  );
};
