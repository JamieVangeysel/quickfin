import { HttpErrorResponse } from '@angular/common/http'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { Router } from '@angular/router'
import { firstValueFrom } from 'rxjs'
import { AuthService } from '../auth.service'

@Component({
  selector: 'qf-sign-in',
  templateUrl: './sign-in.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'relative flex flex-auto w-full'
  }
})
export class SignInComponent implements OnInit, OnDestroy {
  signInForm: FormGroup

  constructor(
    fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private ref: ChangeDetectorRef
  ) {
    this.signInForm = fb.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(12)]],
      remember_me: [false, []]
    })
  }

  async ngOnInit() {
    if (this.auth.isAuthenticated()) {
      this.goToDashboard()
    }
  }

  async ngOnDestroy() {

  }

  async signIn() {
    if (!this.signInForm.valid) return

    try {
      const authorizeResponse = await firstValueFrom(this.auth.authorize(this.signInForm.value))
      let authorization_code = authorizeResponse.authorization_code

      await firstValueFrom(this.auth.getToken(authorization_code, this.signInForm.value.remember_me))
      if (this.hasError(authorizeResponse)) {
        console.error(authorizeResponse.errors)
      }
      this.goToDashboard()
    } catch (err: any) {
      if (err.status && err.message) {
        const errRes = (err as HttpErrorResponse)

        switch (errRes.status) {
          case 0:
            alert(errRes.statusText)
            break
        }
      }
    } finally {
      this.ref.markForCheck()
    }
  }

  goToDashboard() {
    this.router.navigate(['/'])
  }

  hasError(authorizeResponse: IAuthorizeResponse) {
    return authorizeResponse.errors.length > 0
  }
}

export interface IAuthorizeResponse {
  authorization_code?: string
  errors: IAuthorizeError[]
}

export interface IAuthorizeError {
  error: 'PasswordPolicy' | 'Unknown'
  error_code: number
  message: string
  args: any
}
