import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, Subject } from 'rxjs'
import { shareReplay } from 'rxjs/operators'
import { Router } from '@angular/router'
import { environment } from 'src/environments/environment'

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  token: string | undefined

  id_token: any
  id_token_jwt: string | undefined
  access_token: string | undefined
  refresh_token: string | undefined

  change: Subject<any> = new Subject<any>()

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.change.subscribe(response => {
      console.debug('AuthService.constructor() -- response', response)
      if (response) {
        this.id_token = response.id_token
        this.id_token_jwt = response.id_token_jwt
        this.access_token = response.access_token
        this.refresh_token = response.refresh_token
      } else {
        this.id_token = undefined
        this.id_token_jwt = undefined
        this.access_token = undefined
        this.refresh_token = undefined
      }
    })
    if (window.sessionStorage.getItem('session')) {
      const response = JSON.parse(window.sessionStorage.getItem('session') || '')
      this.change.next(response)
    } else if (!environment.production && window.location.hostname === 'localhost') {
      // openid offline_access name given_name email preferred_username picture roles
      this.change.next({
        id_token: {
          exp: new Date(2030, 1, 1).getTime() / 1000,
          name: 'Jamie Vangeysel',
          given_name: 'Jamie',
          family_name: 'Vangeysel',
          email: 'vangeysel-jamie@hotmail.com',
          preferred_username: 'bickyburger',
          picture: 'https://www.gravatar.com/avatar/46ddb451c995eec3d51cd7e94bbcefe5?s=28&d=mp&r=pg',
          roles: [
            '*'
          ]
        },
        id_token_jwt: undefined,
        access_token: undefined,
        refresh_token: undefined
      })
    }
  }

  public authorize(credentials: { username: string, password: string }): Observable<any> {
    return this.http.post<any>(`${environment.api}authorize`, credentials, {
      params: {
        response_type: 'code',
        scope: 'openid offline_access name given_name email preferred_username picture roles'
      }
    }).pipe(shareReplay())
  }

  public getToken(authorization_code: string) {
    const getTokenSub = this.http.get<any>(`${environment.api}token`, {
      params: {
        grant_type: 'authorization_code',
        code: authorization_code
      }
    }).pipe(shareReplay())
    getTokenSub.subscribe(response => {
      window.sessionStorage.setItem('session', JSON.stringify(response))

      this.change.next(response)
    })
    return getTokenSub
  }

  public async refresh(): Promise<boolean> {
    // check if there is a session and check if the refreshToken is still valid
    if (!this.isAuthenticated() && this.refresh_token) {
      // check if the token is expire
      if (new Date(this.id_token.exp * 1000) < new Date()) {
        if (!this.refresh_token) {
          console.warn('There is no refresh token defined!')
          return false
        }
        const resp = await this.http.post<any>(`${environment.api}users/refresh-token`, undefined, {
          params: {
            token: this.refresh_token
          }
        }).toPromise()
        window.sessionStorage.setItem('session', JSON.stringify(resp))
        this.change.next(resp)
        return true
      }
    }

    return false
  }

  public updatePassword(credentials: any) {
    return this.http.post<void>(`${environment.api}users/update-password`, credentials).pipe(shareReplay())
  }

  public register(credentials: { givenName: string, surname: string, username: string, password: string }) {
    return this.http.post<any>(`${environment.api}users/sign-up`, credentials)
  }

  public async logout() {
    try {
      window.sessionStorage.removeItem('session')
      this.change.next(undefined)
    } finally {
      this.router.navigate(['/auth/sign-in'], {
        replaceUrl: true
      })
    }
  }

  public isAuthenticated(): boolean {
    if (this.id_token) {
      if (new Date(this.id_token.exp * 1000) > new Date()) {
        return true
      }
      // must renew the id_token because it's expired
    }
    return false
  }
}
