import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { SignInComponent } from './sign-in/sign-in.component'
import { RouterModule } from '@angular/router'
import { ReactiveFormsModule } from '@angular/forms'
import { SignUpComponent } from './sign-up/sign-up.component'

@NgModule({
  declarations: [
    SignInComponent,
    SignUpComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild([{
      path: 'sign-in',
      component: SignInComponent,
      data: {
        layout: 'empty'
      }
    }, {
      path: 'sign-up',
      component: SignUpComponent,
      data: {
        layout: 'empty'
      }
    }, {
      path: '',
      pathMatch: 'full',
      redirectTo: 'sign-in'
    }]),
  ]
})
export class AuthModule { }
