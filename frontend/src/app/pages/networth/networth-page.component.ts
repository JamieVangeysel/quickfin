import { ChangeDetectionStrategy, Component } from '@angular/core'

@Component({
  selector: 'qf-networth-page',
  templateUrl: './networth-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'relative flex flex-auto w-full'
  }
})
export class NetworthPageComponent {

}
