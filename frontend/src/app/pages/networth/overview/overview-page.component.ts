import { ChangeDetectionStrategy, Component } from '@angular/core'

@Component({
  selector: 'qf-overview-page',
  templateUrl: './overview-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'relative flex flex-auto w-full'
  }
})
export class OverviewPageComponent {
  private _assets: any[] = []
  private _liabilities: any[] = []

  constructor() {
    this._assets = [
      {
        name: 'Grote/vaste bezittingen',
        value: 99250
      }, {
        name: 'Liquide middelen',
        value: 75223
      }, {
        name: 'Persoonlijke voorwerpen',
        value: 3200
      }
    ]

    this._liabilities = [
      {
        name: 'Langlopende schulden',
        value: 102834
      }, {
        name: 'Kortlopende schulden',
        value: 400
      }
    ]
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
