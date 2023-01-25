import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { DashboardPageComponent } from './dashboard-page.component'
import { NgApexchartsModule } from 'ng-apexcharts'
import { MatMenuModule } from '@angular/material/menu'

@NgModule({
  declarations: [
    DashboardPageComponent
  ],
  imports: [
    CommonModule,
    NgApexchartsModule,
    MatMenuModule,
    RouterModule.forChild([{
      path: '',
      component: DashboardPageComponent
    }])
  ]
})
export class DashboardPageModule { }
