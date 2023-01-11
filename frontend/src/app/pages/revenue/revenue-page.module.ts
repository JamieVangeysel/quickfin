import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { RevenuePageComponent } from './revenue-page.component'

@NgModule({
  declarations: [
    RevenuePageComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([{
      path: '',
      component: RevenuePageComponent
    }])
  ]
})
export class RevenuePageModule { }
