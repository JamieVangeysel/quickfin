import { Injectable } from '@angular/core'
import { CanActivate, Router } from '@angular/router'
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
    if (this.auth.isAuthenticated()) {
      console.debug('Authenticated?', this.auth.isAuthenticated())
      return true
    }

    if (await this.auth.refresh()) {
      return true
    }

    this.router.navigate(['/'])
    return false
  }
}
