import { ChangeDetectionStrategy, Component } from '@angular/core'

@Component({
  selector: 'qf-liabilities-page',
  templateUrl: './liabilities-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'relative flex flex-auto w-full'
  }
})
export class LiabilitiesPageComponent {

}
