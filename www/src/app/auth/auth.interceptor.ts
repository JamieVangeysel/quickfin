import { BehaviorSubject, catchError, filter, finalize, firstValueFrom, from, mergeMap, Observable, switchMap, take, throwError } from 'rxjs'
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http'
import { Injectable, Injector } from '@angular/core'
import { AuthService } from './auth.service'

const API_URL = 'quickfin.be/api'

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private refreshTokenInProgress = false;
  private refreshTokenSubject: BehaviorSubject<string | undefined> = new BehaviorSubject<string | undefined>(undefined)

  constructor(private auth: AuthService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(this.addAuthToken(request)).pipe(
      catchError((requestError: HttpErrorResponse) => {
        if (requestError && requestError.status === 401) {
          if (this.refreshTokenInProgress) {
            return this.refreshTokenSubject.pipe(
              filter((result) => result !== undefined),
              take(1),
              switchMap(() => next.handle(this.addAuthToken(request)))
            );
          } else {
            this.refreshTokenInProgress = true
            this.refreshTokenSubject.next(undefined)

            return this.auth.refresh().pipe(
              switchMap((token) => {
                this.refreshTokenSubject.next(token)
                return next.handle(this.addAuthToken(request))
              }),
              finalize(() => (this.refreshTokenInProgress = false))
            );
          }
        } else {
          return throwError(() => new Error(requestError.message))
        }
      })
    )
  }

  addAuthToken(request: HttpRequest<any>) {
    const token = this.auth.access_token

    if (!token) {
      return request
    }

    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      }
    })
  }
}
