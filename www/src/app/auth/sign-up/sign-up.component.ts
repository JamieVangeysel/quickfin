import { HttpErrorResponse } from '@angular/common/http'
import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core'
import { FormGroup, FormBuilder, Validators } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
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
    route: ActivatedRoute,
    private auth: AuthService,
    private router: Router,
    private ref: ChangeDetectorRef
  ) {
    this.signUpForm = fb.group({
      username: ['', [Validators.required, Validators.email]],
      given_name: ['', [Validators.required, Validators.minLength(2)]],
      family_name: ['', [Validators.required, Validators.minLength(2)]],
      password: ['', [Validators.required, Validators.minLength(12)]],
      remmeber_me: [false, []]
    })

    firstValueFrom(route.queryParams).then(params => {
      if (params['login_hint'])
        this.signUpForm.controls['username'].setValue(params['login_hint'])
    })
  }

  async signUp() {
    if (!this.signUpForm.valid) return

    try {
      const response = await firstValueFrom(this.auth.register(this.signUpForm.value))
      if (response.success) {
        alert('Jouw account is aangemaakt, je kan je nu inloggen.')
        this.goToDashboard(this.signUpForm.value.username)
      }
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

  goToDashboard(username: string) {
    this.router.navigate([`/auth/sign-in?login_hint=${username}`])
  }
}
