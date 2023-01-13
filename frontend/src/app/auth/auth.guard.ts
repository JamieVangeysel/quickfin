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
    if (this.auth.isAuthenticated()) {
      return true
    }

    if (await firstValueFrom(this.auth.refresh())) {
      return true
    }

    this.router.navigate(['/auth/sign-in'])
    return false
  }
}
