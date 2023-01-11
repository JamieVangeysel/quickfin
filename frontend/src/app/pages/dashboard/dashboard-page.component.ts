import { ChangeDetectionStrategy, Component } from '@angular/core'

@Component({
  selector: 'qf-dashboard-page',
  templateUrl: './dashboard-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'relative flex flex-auto w-full'
  }
})
export class DashboardPageComponent {

}
