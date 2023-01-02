import { Observable } from 'rxjs'
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http'
import { Injectable, Injector } from '@angular/core'
import { AuthService } from './auth.service'

const API_URL = 'quickfin.be/api'

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private inj: Injector) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (request.url.indexOf(API_URL) !== -1) {
      const auth = this.inj.get<AuthService>(AuthService)
      if (auth.access_token) {
        request = request.clone({
          setHeaders: { 'Authorization': 'Bearer ' + auth.access_token }
        })
      }
    }
    return next.handle(request)
  }
}
