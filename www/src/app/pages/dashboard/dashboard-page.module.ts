import { NgModule } from '@angular/core'
import { CommonModule, DatePipe } from '@angular/common'
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
  ],
  providers: [
    DatePipe
  ]
})
export class DashboardPageModule { }
