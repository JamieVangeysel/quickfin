import { ChangeDetectionStrategy, Component } from '@angular/core'
import pck from '../../../../../package.json'

@Component({
  selector: 'qf-footer',
  templateUrl: './footer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent {
  constructor() { }

  get year(): number {
    return new Date().getFullYear()
  }

  get version(): string {
    return pck.version
  }
}
