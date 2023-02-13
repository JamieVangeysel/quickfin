import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { NetworthPageComponent } from './networth-page.component'
import { AssetsPageComponent } from './assets/assets-page.component'
import { LiabilitiesPageComponent } from './liabilities/liabilities-page.component'
import { OverviewPageComponent } from './overview/overview-page.component'

@NgModule({
  declarations: [
    NetworthPageComponent,
    AssetsPageComponent,
    LiabilitiesPageComponent,
    OverviewPageComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([{
      path: '',
      component: NetworthPageComponent,
      children: [{
        path: '',
        component: OverviewPageComponent,
        data: {
          layout: 'modern'
        }
      }, {
        path: 'assets',
        component: AssetsPageComponent,
        data: {
          layout: 'modern'
        }
      }, {
        path: 'liabilities',
        component: LiabilitiesPageComponent,
        data: {
          layout: 'modern'
        }
      }]
    }])
  ]
})
export class NetworthPageModule { }
