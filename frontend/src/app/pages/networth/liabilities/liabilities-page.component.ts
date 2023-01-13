import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import { IGetNetworthEntry, ILiabilitiesGroup, NetworthApiService } from 'src/app/api/networth-api.service'

@Component({
  selector: 'qf-liabilities-page',
  templateUrl: './liabilities-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'relative flex flex-auto w-full'
  }
})
export class LiabilitiesPageComponent implements OnInit {
  private _groups: ILiabilitiesGroup[] = []

  constructor(
    private ref: ChangeDetectorRef,
    private networthApi: NetworthApiService
  ) {
  }

  async ngOnInit() {
    try {
      const liabilities = await this.networthApi.getLiabilities()
      if (liabilities) {
        this._groups = liabilities.groups
      }
    } catch (err) {
      console.log(err)
    } finally {
      this.ref.markForCheck()
    }
  }

  async edit(liability: IGetNetworthEntry, group_id: number) {
    const newLabel = prompt('Nieuwe label: ', liability.name) ?? liability.name
    const newValue = prompt('Nieuwe waarde: ', liability.value.toString()) ?? liability.value

    if (+newValue >= 0) {
      if (newLabel === liability.name && +newValue === liability.value) {
        alert('Er zijn geen wijzigingen opgeslagen!')
      } else {
        // try to update item !
        try {
          const resp = await this.networthApi.updateLiability({
            id: liability.id,
            name: newLabel,
            value: +newValue,
            group_id
          })

          if (resp.success) {
            alert('Opgeslagen!')
            liability.name = newLabel
            liability.value = +newValue
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

  get groups(): ILiabilitiesGroup[] {
    return this._groups
  }

  get culture(): string {
    return 'nl-BE'
  }
}
