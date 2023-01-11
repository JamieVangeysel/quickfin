import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { AuthGuard } from '../auth/auth.guard'

const routes: Routes = [{
  path: 'auth',
  loadChildren: () => import('../auth/auth.module').then(m => m.AuthModule),
}, {
  path: '',
  loadChildren: () => import('./dashboard/dashboard-page.module').then(m => m.DashboardPageModule),
  canActivate: [AuthGuard],
  data: {
    layout: 'modern'
  }
}, {
  path: 'revenue',
  loadChildren: () => import('./revenue/revenue-page.module').then(m => m.RevenuePageModule),
  canActivate: [AuthGuard],
  data: {
    layout: 'modern'
  }
}, {
  path: 'expenses',
  loadChildren: () => import('./expenses/expenses-page.module').then(m => m.ExpensesPageModule),
  canActivate: [AuthGuard],
  data: {
    layout: 'modern'
  }
}, {
  path: 'budget',
  loadChildren: () => import('./budget/budget-page.module').then(m => m.BudgetPageModule),
  canActivate: [AuthGuard],
  data: {
    layout: 'modern'
  }
}, {
  path: 'networth',
  loadChildren: () => import('./networth/networth-page.module').then(m => m.NetworthPageModule),
  canActivate: [AuthGuard],
  data: {
    layout: 'modern'
  }
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
export class PagesRoutingModule { }
