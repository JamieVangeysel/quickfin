import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { firstValueFrom, from, Observable, of, Subject } from 'rxjs'
import { map, share, shareReplay } from 'rxjs/operators'
import { Router } from '@angular/router'
import { environment } from 'src/environments/environment'

const SESSION_KEY = 'quickfin.session'
const REFRESH_TOKEN_KEY = 'quickfin.refresh_token'

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  token: string | undefined

  id_token: any
  id_token_jwt: string | undefined
  access_token: string | undefined

  change: Subject<any> = new Subject<any>()

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.change.subscribe((response: IGetTokenResponse) => {
      console.debug('AuthService.constructor() -- response', response)
      if (response) {
        if (!response.id_token_jwt) {
          const object = JSON.parse(window.atob(response.id_token.split('.')[1]))
          response = {
            ...response,
            id_token: object,
            id_token_jwt: response.id_token
          }
        }
        this.id_token = response.id_token
        this.id_token_jwt = response.id_token_jwt
        this.access_token = response.access_token
      } else {
        this.id_token = undefined
        this.id_token_jwt = undefined
        this.access_token = undefined
      }
    })
    if (window.sessionStorage.getItem(SESSION_KEY)) {
      const response = JSON.parse(window.sessionStorage.getItem(SESSION_KEY) || '')
      this.change.next(response)
    }
  }

  public authorize(credentials: { username: string, password: string }): Observable<any> {
    return this.http.post<any>(`${environment.api}authorize`, credentials, {
      params: {
        response_type: 'code',
        scope: 'openid offline_access name given_name family_name email picture roles'
      }
    }).pipe(shareReplay())
  }

  public getToken(authorization_code: string, remember_me: boolean = false) {
    const getTokenSub = this.http.get<IGetTokenResponse>(`${environment.api}token`, {
      params: {
        grant_type: 'authorization_code',
        code: authorization_code
      }
    }).pipe(shareReplay())
    getTokenSub.subscribe(session => {
      if (session.refresh_token) {
        const refresh_token = session.refresh_token
        delete session.refresh_token

        if (remember_me)
          window.localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token)
        else
          window.sessionStorage.setItem(REFRESH_TOKEN_KEY, refresh_token)
      }
      window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))

      this.change.next(session)
    })
    return getTokenSub
  }

  public refresh(): Observable<string | undefined> {
    // check if there is a session and check if the refreshToken is still valid
    if (!this.isAuthenticated() && this.refresh_token) {
      if (this.refresh_token === undefined) {
        console.warn('There is no refresh token defined!')
        return of(undefined)
      }

      const r = this.http.post<any>(`${environment.api}users/refresh-token`, undefined, {
        params: {
          token: `${this.refresh_token}`
        }
      }).pipe(shareReplay())
      r.subscribe(resp => {
        const refresh_token = resp.refresh_token
        delete resp.refresh_token

        if (window.localStorage.getItem(REFRESH_TOKEN_KEY))
          window.localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token)
        else
          window.sessionStorage.setItem(REFRESH_TOKEN_KEY, refresh_token)
        window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(resp))
        this.change.next(resp)
      })
      return r.pipe<string | undefined>(map(resp => resp.refresh_token))
    }

    return of(undefined)
  }

  public updatePassword(credentials: any) {
    return this.http.post<void>(`${environment.api}users/update-password`, credentials).pipe(shareReplay())
  }

  public register(credentials: { givenName: string, surname: string, username: string, password: string }) {
    return this.http.post<any>(`${environment.api}users/sign-up`, credentials)
  }

  public async logout() {
    try {
      window.localStorage.removeItem(REFRESH_TOKEN_KEY)
      window.sessionStorage.removeItem(REFRESH_TOKEN_KEY)
      window.sessionStorage.removeItem(SESSION_KEY)
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

  public get expired(): boolean {
    return this.id_token && new Date(this.id_token.exp * 1000) < new Date()
  }

  public get refresh_token(): string | undefined {
    return window.localStorage.getItem(REFRESH_TOKEN_KEY) ?? window.sessionStorage.getItem(REFRESH_TOKEN_KEY) ?? undefined
  }
}

export interface IGetTokenResponse {
  access_token: string
  token_type: 'Bearer'
  expires_in: number
  id_token: string
  refresh_token?: string
  id_token_jwt?: string
}