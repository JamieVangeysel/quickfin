import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core'
import { NetworthApiService } from 'src/app/api/networth-api.service'

@Component({
  selector: 'qf-overview-page',
  templateUrl: './overview-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'relative flex flex-auto w-full'
  }
})
export class OverviewPageComponent implements OnInit {
  private _assets: any[] = []
  private _liabilities: any[] = []

  constructor(
    private ref: ChangeDetectorRef,
    private networthApi: NetworthApiService
  ) {
  }

  async ngOnInit() {
    try {
      const overview = await this.networthApi.getOverview()
      if (overview) {
        this._assets = overview.assets ?? []
        this._liabilities = overview.liabilities ?? []
      }
    } catch (err) {
      console.log(err)
    } finally {
      this.ref.markForCheck()
    }
  }

  get assets(): any[] {
    return this._assets
  }

  get liabilities(): any[] {
    return this._liabilities
  }

  get assetsValue(): number {
    return this._assets.reduce((prev, curr) => prev + curr.value, 0)
  }

  get liabilitiesValue(): number {
    return this._liabilities.reduce((prev, curr) => prev + curr.value, 0)
  }

  get networth(): number {
    return this.assetsValue - this.liabilitiesValue
  }

  get culture(): string {
    return 'nl-BE'
  }
}