import { Injectable } from '@angular/core'
import { CanActivate, Router } from '@angular/router'
import { firstValueFrom } from 'rxjs'
import { AuthService } from './auth.service'

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router
  ) {
  }

  async canActivate(): Promise<boolean> {
    try {
      if (this.auth.isAuthenticated()) {
        // console.debug('AuthGuard.canActivate() -- this.auth.isAuthenticated(): ', true)
        return true
      }

      const token = await firstValueFrom(this.auth.refresh())
      if (token) {
        // console.debug('AuthGuard.canActivate() -- this.auth.refresh(): ', token, true)
        return true
      }
    } catch (err) {
      console.error('AuthGuard.canActivate() -- error: ', err)
    }

    // console.debug('AuthGuard.canActivate() -- user is not authenticated', false)
    this.router.navigate(['/auth/sign-in'])
    return false
  }
}
