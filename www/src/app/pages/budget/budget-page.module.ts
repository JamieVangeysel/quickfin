import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { BudgetPageComponent } from './budget-page.component'
import { ReactiveFormsModule } from '@angular/forms'

@NgModule({
  declarations: [
    BudgetPageComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild([{
      path: '',
      component: BudgetPageComponent
    }])
  ]
})
export class BudgetPageModule { }
