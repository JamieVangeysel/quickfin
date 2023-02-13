import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnChanges } from '@angular/core'
import { NetworthApiService } from 'src/app/api/networth-api.service'

@Component({
  selector: 'qf-networth-page',
  templateUrl: './networth-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'relative flex flex-auto w-full'
  }
})
export class NetworthPageComponent implements OnChanges {
  _networth: number = 0

  constructor(
    private ref: ChangeDetectorRef,
    private networthApi: NetworthApiService
  ) {
    this.ngOnChanges()
  }

  async ngOnChanges() {
    const resp = await this.networthApi.get()
    this._networth = resp.value
  }

  get networth(): number {
    return this._networth
  }

  get culture(): string {
    return 'nl-BE'
  }
}
