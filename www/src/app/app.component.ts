import { ChangeDetectionStrategy, Component } from '@angular/core'
import pck from '../../package.json'
import { AuthService } from './auth/auth.service'

@Component({
  selector: 'qf-root',
  template: '<qf-layout></qf-layout>',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex-auto w-full h-full',
    'qf-version': pck.version
  }
})
export class AppComponent {
  constructor(
    auth: AuthService
  ) {
    console.debug('isAuthenticated?', auth.isAuthenticated())
  }

  async ngOnInit(): Promise<void> {
  }
}
