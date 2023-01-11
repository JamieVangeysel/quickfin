import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { BudgetPageComponent } from './budget-page.component'

@NgModule({
  declarations: [
    BudgetPageComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([{
      path: '',
      component: BudgetPageComponent
    }])
  ]
})
export class BudgetPageModule { }
