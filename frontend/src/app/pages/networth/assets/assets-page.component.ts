import { ChangeDetectionStrategy, Component } from '@angular/core'

@Component({
  selector: 'qf-assets-page',
  templateUrl: './assets-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'relative flex flex-auto w-full'
  }
})
export class AssetsPageComponent {

}
