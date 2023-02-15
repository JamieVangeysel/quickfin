import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { ExpensesPageComponent } from './expenses-page.component'
import { ReactiveFormsModule } from '@angular/forms'

@NgModule({
  declarations: [
    ExpensesPageComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild([{
      path: '',
      component: ExpensesPageComponent
    }])
  ]
})
export class ExpensesPageModule { }
