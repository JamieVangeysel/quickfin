import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { RevenuePageComponent } from './revenue-page.component'
import { MatMenuModule } from '@angular/material/menu'

@NgModule({
  declarations: [
    RevenuePageComponent
  ],
  imports: [
    CommonModule,
    MatMenuModule,
    RouterModule.forChild([{
      path: '',
      component: RevenuePageComponent
    }])
  ]
})
export class RevenuePageModule { }
