import { ChangeDetectionStrategy, Component } from '@angular/core'
import pck from '../../package.json'
import { AnalyticsApiService } from './api/analytics-api.service'
import { AuthService } from './auth/auth.service'

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
  constructor(
    auth: AuthService,
    private analytics: AnalyticsApiService
  ) {
    console.debug('isAuthenticated?', auth.isAuthenticated())

    this.ngOnInit()
  }

  async ngOnInit(): Promise<void> {
    const resp = await this.analytics.get()
    console.log(resp)
  }
}
