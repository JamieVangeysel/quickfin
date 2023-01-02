import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { SignInComponent } from './sign-in/sign-in.component'
import { RouterModule } from '@angular/router'
import { ReactiveFormsModule } from '@angular/forms'

@NgModule({
  declarations: [
    SignInComponent
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
      path: '',
      pathMatch: 'full',
      redirectTo: '/auth/sign-in'
    }]),
  ]
})
export class AuthModule { }
