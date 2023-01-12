import { HttpErrorResponse } from '@angular/common/http'
import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core'
import { FormGroup, FormBuilder, Validators } from '@angular/forms'
import { Router } from 'express'
import { firstValueFrom } from 'rxjs/internal/firstValueFrom'
import { AuthService } from '../auth.service'

@Component({
  selector: 'qf-sign-up',
  templateUrl: './sign-up.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'relative flex flex-auto w-full'
  }
})
export class SignUpComponent {
  signUpForm: FormGroup

  constructor(
    fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private ref: ChangeDetectorRef
  ) {
    this.signUpForm = fb.group({
      username: ['', [Validators.required, Validators.email]],
      given_name: ['', [Validators.required]],
      family_name: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(12)]],
      remmeber_me: [false, []]
    })
  }

  async signUp() {
    if (!this.signUpForm.valid) return

    try {
      const authorizeResponse = await firstValueFrom(this.auth.register(this.signUpForm.value))
      let authorization_code = authorizeResponse.authorization_code

      await firstValueFrom(this.auth.getToken(authorization_code))
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
}
