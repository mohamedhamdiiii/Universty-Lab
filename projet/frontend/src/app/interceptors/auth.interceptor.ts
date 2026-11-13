import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, tap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Auth Interceptor — functional interceptor for Angular standalone apps.
 *
 * - Attaches the JWT Bearer token to all outgoing API requests (except login/register).
 * - Reads the X-Refreshed-Token header from responses and updates the stored token.
 * - Handles 401 Unauthorized responses by clearing auth state and redirecting to login.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Don't attach token to login or register requests
  const isAuthRequest = req.url.includes('/user/login') || req.url.includes('/user/register');

  let authReq = req;

  if (!isAuthRequest) {
    const token = authService.getToken();
    if (token) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true
      });
    }
  }

  return next(authReq).pipe(
    // Check for refreshed token in response headers
    tap(event => {
      if (event.type !== 0) { // Not a Sent event
        const httpResponse = event as any;
        if (httpResponse.headers) {
          const refreshedToken = httpResponse.headers.get('X-Refreshed-Token');
          if (refreshedToken) {
            authService.updateToken(refreshedToken);
          }
        }
      }
    }),

    // Handle 401 errors
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isAuthRequest) {
        // Token is invalid or expired — logout and redirect
        authService.logout();
      }
      return throwError(() => error);
    })
  );
};
