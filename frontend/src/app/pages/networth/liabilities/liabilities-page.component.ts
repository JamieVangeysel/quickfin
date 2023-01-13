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

  async create(group_id: number) {
    const newLabel = prompt('Label: ')
    if (!newLabel) return
    const newValue = prompt('Waarde: ')
    if (!newValue) return

    if (+newValue >= 0 && newLabel.length > 0) {
      // try to create item !
      try {
        const resp = await this.networthApi.createLiability({
          name: newLabel,
          value: +newValue,
          group_id
        })

        if (resp.success) {
          alert('Aangemaakt!')

          const group = this._groups.find(e => e.id === group_id)
          if (group) {
            if (!group.liabilities) group.liabilities = []
            if (group.liabilities) {
              group.liabilities.push({
                id: resp.id,
                name: newLabel,
                value: +newValue,
                group_id
              })
            }
          }
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

  async edit(liability: IGetNetworthEntry, group_id: number) {
    const newLabel = prompt('Nieuwe label: ', liability.name)
    if (!newLabel) return
    const newValue = prompt('Nieuwe waarde: ', liability.value.toString())
    if (!newValue) return

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

  async delete(liability: IGetNetworthEntry, group_id: number) {
    const confirmed = confirm(`Weet je zeker dat je '${liability.name}' wilt verwijderen?`)
    if (confirmed === true) {
      // try to update item !
      try {
        const resp = await this.networthApi.deleteLiability(liability.id)

        if (resp.success) {
          alert('Verwijderd!')
          const group = this._groups.find(e => e.id === group_id)
          if (group) {
            group.liabilities.splice(group.liabilities.indexOf(liability), 1)
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

  totalValue(entries: IGetNetworthEntry[] | null) {
    return entries ? entries.reduce((prev, curr) => prev + curr.value, 0) : 0
  }

  get groups(): ILiabilitiesGroup[] {
    return this._groups
  }

  get culture(): string {
    return 'nl-BE'
  }
}
