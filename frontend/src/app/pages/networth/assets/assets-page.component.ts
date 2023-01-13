import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core'
import { IAssetsGroup, IGetNetworthEntry, NetworthApiService } from 'src/app/api/networth-api.service'

@Component({
  selector: 'qf-assets-page',
  templateUrl: './assets-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'relative flex flex-auto w-full'
  }
})
export class AssetsPageComponent implements OnInit {
  private _groups: IAssetsGroup[] = []

  constructor(
    private ref: ChangeDetectorRef,
    private networthApi: NetworthApiService
  ) {
  }

  async ngOnInit() {
    try {
      const assets = await this.networthApi.getAssets()
      if (assets) {
        this._groups = assets.groups
      }
    } catch (err) {
      console.log(err)
    } finally {
      this.ref.markForCheck()
    }
  }

  async edit(asset: IGetNetworthEntry, group_id: number) {
    const newLabel = prompt('Nieuwe label: ', asset.name) ?? asset.name
    const newValue = prompt('Nieuwe waarde: ', asset.value.toString()) ?? asset.value

    if (+newValue >= 0) {
      if (newLabel === asset.name && +newValue === asset.value) {
        alert('Er zijn geen wijzigingen opgeslagen!')
      } else {
        // try to update item !
        try {
          const resp = await this.networthApi.updateAsset({
            id: asset.id,
            name: newLabel,
            value: +newValue,
            group_id
          })

          if (resp.success) {
            alert('Opgeslagen!')
            asset.name = newLabel
            asset.value = +newValue
          }
          console.log('Nieuwe waardes: ', newLabel, +newValue, group_id)
        } catch (err) {
          console.log(err)
          alert('Er is een onbekende fout opgetreden tijdens het behandelen van je verzoek!')
        } finally {
          this.ref.markForCheck()
        }
      }
    } else {
      alert('Er is een fout opgetreden tijdens het verwerken van je ingegeven waardes, waarde moet een getal groter of gelijk aan 0 zijn!')
    }
  }

  totalValue(entries: IGetNetworthEntry[]) {
    return entries.reduce((prev, curr) => prev + curr.value, 0)
  }

  get groups(): IAssetsGroup[] {
    return this._groups
  }

  get culture(): string {
    return 'nl-BE'
  }
}
