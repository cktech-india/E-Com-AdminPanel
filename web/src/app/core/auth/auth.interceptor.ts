import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandlerFn,
    HttpRequest,
} from '@angular/common/http';
import { inject, Injector } from '@angular/core';
import { AuthService } from 'app/core/auth/auth.service';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { Observable, catchError, throwError } from 'rxjs';

/**
 * Intercept
 *
 * @param req
 * @param next
 */
export const authInterceptor = (
    req: HttpRequest<unknown>,
    next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
    const injector = inject(Injector);
    
    // Get the access token directly from storage to avoid circular dependency
    // but we might still need authService for signOut()
    const accessToken = sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken') || '';

    // Clone the request object
    let newReq = req.clone();
    
    // Get tenantId from sessionStorage or fallback to 'default'
    const tenantId = sessionStorage.getItem('tenantId') || 'default';

    // Check if request is for tenant-details
    const isTenantDetails = req.url.includes('tenant-details');
    const isApiRequest = 
        req.url.startsWith('api/') || 
        req.url.startsWith('authenticate/') || 
        req.url.includes('/api/') || 
        req.url.includes('/authenticate/');

    // Request
    //
    // If the access token didn't expire, add the Authorization header.
    if (
        accessToken
        //&& !AuthUtils.isTokenExpired(accessToken)
    ) {
        newReq = req.clone({
            headers: isTenantDetails
                ? req.headers.set('Authorization', 'Bearer ' + accessToken)
                : req.headers.set('Authorization', 'Bearer ' + accessToken).set('X-tenant', tenantId),
        });
    } else {
        newReq = req.clone({
            headers: isTenantDetails
                ? req.headers
                : req.headers.set('X-tenant', tenantId),
        });
    }

    // Response
    return next(newReq).pipe(
        catchError((error) => {
            // Catch "401 Unauthorized" or "403 Forbidden" responses
            if (error instanceof HttpErrorResponse && (error.status === 401 || error.status === 403)) {
                console.error('AuthInterceptor: HTTP Error caught', {
                    url: req.url,
                    status: error.status,
                    isApiRequest,
                    error: error
                });

                // Check if we have a token in storage
                const token = sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken');

                if (token && isApiRequest) {
                    // Sign out lazily to avoid circular dependency
                    const authService = injector.get(AuthService);
                    authService.signOut();

                    // Save request URL and status to sessionStorage before reload
                    sessionStorage.setItem('lastFailedRequestUrl', req.url);
                    sessionStorage.setItem('lastFailedRequestStatus', error.status.toString());

                    location.reload();
                }
            }

            return throwError(error);
        })
    );
};
