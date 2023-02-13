import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { ExpensesPageComponent } from './expenses-page.component'
import { MatMenuModule } from '@angular/material/menu'

@NgModule({
  declarations: [
    ExpensesPageComponent
  ],
  imports: [
    CommonModule,
    MatMenuModule,
    RouterModule.forChild([{
      path: '',
      component: ExpensesPageComponent
    }])
  ]
})
export class ExpensesPageModule { }
