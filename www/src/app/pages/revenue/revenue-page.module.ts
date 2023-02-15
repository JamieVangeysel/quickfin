import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { RevenuePageComponent } from './revenue-page.component'
import { ReactiveFormsModule } from '@angular/forms'

@NgModule({
  declarations: [
    RevenuePageComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild([{
      path: '',
      component: RevenuePageComponent
    }])
  ]
})
export class RevenuePageModule { }
