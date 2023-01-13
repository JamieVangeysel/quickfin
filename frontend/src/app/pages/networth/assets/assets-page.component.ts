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

  async create(group_id: number) {
    const newLabel = prompt('Label: ')
    if (!newLabel) return
    const newValue = prompt('Waarde: ')
    if (!newValue) return

    if (+newValue >= 0 && newLabel.length > 0) {
      // try to create item !
      try {
        const resp = await this.networthApi.createAsset({
          name: newLabel,
          value: +newValue,
          group_id
        })

        if (resp.success) {
          alert('Aangemaakt!')

          const group = this._groups.find(e => e.id === group_id)
          group?.assets.push({
            id: resp.id,
            name: newLabel,
            value: +newValue,
            group_id
          })
        }
      } catch (err) {
        console.log(err)
        alert('Er is een onbekende fout opgetreden tijdens het behandelen van je verzoek!')
      } finally {
        this.ref.markForCheck()
      }
    } else {
      alert('De ingevoerde waardes bevatten een fout!')
    }
  }

  async edit(asset: IGetNetworthEntry, group_id: number) {
    const newLabel = prompt('Nieuwe label: ', asset.name)
    if (!newLabel) return
    const newValue = prompt('Nieuwe waarde: ', asset.value.toString())
    if (!newValue) return

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

  async delete(asset: IGetNetworthEntry, group_id: number) {
    const confirmed = confirm(`Weet je zeker dat je '${asset.name}' wilt verwijderen?`)
    if (confirmed === true) {
      // try to update item !
      try {
        const resp = await this.networthApi.deleteLiability(asset.id)

        if (resp.success) {
          alert('Verwijderd!')
          const group = this._groups.find(e => e.id === group_id)
          if (group) {
            group.assets.splice(group.assets.indexOf(asset), 1)
          }
        }
      } catch (err) {
        console.log(err)
        alert('Er is een onbekende fout opgetreden tijdens het behandelen van je verzoek!')
      } finally {
        this.ref.markForCheck()
      }
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
