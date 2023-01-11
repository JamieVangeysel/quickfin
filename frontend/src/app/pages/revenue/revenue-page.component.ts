import { ChangeDetectionStrategy, Component } from '@angular/core'

@Component({
  selector: 'qf-revenue-page',
  templateUrl: './revenue-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'relative flex flex-auto w-full'
  }
})
export class RevenuePageComponent {

}
