import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { StocksPageComponent } from './stocks-page.component'
import { NgApexchartsModule } from 'ng-apexcharts'
import { RouterModule } from '@angular/router'
import { ReactiveFormsModule } from '@angular/forms'

@NgModule({
  declarations: [
    StocksPageComponent
  ],
  imports: [
    CommonModule,
    NgApexchartsModule,
    ReactiveFormsModule,
    RouterModule.forChild([{
      path: '',
      component: StocksPageComponent
    }])
  ]
})
export class StocksPageModule { }
