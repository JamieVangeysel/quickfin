import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { AuthGuard } from './auth/auth.guard'

const routes: Routes = [{
  path: 'auth',
  loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule),
}, {
  /* Temporarily fix all auth issues */
  path: '**',
  // component: DashboardPageComponent,
  redirectTo: '/auth/sign-in',
  // canActivate: [AuthGuard]
}]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
