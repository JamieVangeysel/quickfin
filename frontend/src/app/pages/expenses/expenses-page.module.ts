import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { ExpensesPageComponent } from './expenses-page.component'

@NgModule({
  declarations: [
    ExpensesPageComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([{
      path: '',
      component: ExpensesPageComponent
    }])
  ]
})
export class ExpensesPageModule { }
