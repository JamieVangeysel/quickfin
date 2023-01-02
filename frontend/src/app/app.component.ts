import { ChangeDetectionStrategy, Component } from '@angular/core'
import pck from '../../package.json'

@Component({
  selector: 'qf-root',
  template: '<qf-layout></qf-layout>',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex-auto w-full h-full',
    'emp-version': pck.version
  }
})
export class AppComponent {

}
