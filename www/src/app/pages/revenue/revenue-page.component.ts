import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core'
import { IJournalEntry, JournalApiService } from 'src/app/api/journal-api.service'

@Component({
  selector: 'qf-revenue-page',
  templateUrl: './revenue-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'relative flex flex-auto w-full'
  }
})
export class RevenuePageComponent {
  private _revenues: IJournalEntry[] = []

  constructor(
    private ref: ChangeDetectorRef,
    private journalApi: JournalApiService
  ) { }

  async ngOnInit() {
    try {
      const journal = await this.journalApi.getEntries(true)
      if (journal) {
        this._revenues = journal ?? []
      }
      console.log(this.revenues)
    } catch (err) {
      console.log(err)
    } finally {
      this.ref.markForCheck()
    }
  }

  async create() {
    const newLabel = prompt('Label: ')
    if (!newLabel) return
    const newCategory = prompt('Categorie: ')
    if (!newCategory) return
    const newDate = prompt('Datum: ')
    if (!newDate) return
    const newAmount = prompt('Waarde: ')
    if (!newAmount) return

    if (+newAmount >= 0 && newDate.length > 0 && newLabel.length > 0 && newCategory.length > 0 && newDate.match('[0-9]{4}-[0-9]{2}-[0-9]{2}')) {
      // try to create item !
      try {
        const resp = await this.journalApi.createEntry({
          name: newLabel,
          category: newCategory,
          amount: +newAmount,
          date: new Date(Date.parse(newDate))
        })

        if (resp.success) {
          // alert('Aangemaakt!')

          if (!this._revenues) this._revenues = []
          if (this._revenues) {
            this._revenues.push({
              id: resp.id,
              name: newLabel,
              category: newCategory,
              amount: +newAmount,
              date: new Date(Date.parse(newDate))
            })
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

  async edit(revenue: IJournalEntry) {
    const newLabel = prompt('Nieuwe label: ', revenue.name)
    if (!newLabel) return
    const newCategory = prompt('Nieuwe categorie: ', revenue.category)
    if (!newCategory) return
    const newDate = prompt('Nieuwe datum: ', `${revenue.date.toString().split('T')[0]}`)
    if (!newDate) return
    const newAmount = prompt('Nieuwe waarde: ', revenue.amount.toString())
    if (!newAmount) return

    if (+newAmount >= 0) {
      if (newLabel === revenue.name && newCategory === revenue.category && +newAmount === revenue.amount && newDate.match('[0-9]{4}-[0-9]{2}-[0-9]{2}')) {
        alert('Er zijn geen wijzigingen opgeslagen!')
      } else {
        // try to update item !
        try {
          const resp = await this.journalApi.updateEntry({
            id: revenue.id,
            name: newLabel,
            category: newCategory,
            amount: +newAmount,
            date: new Date(Date.parse(newDate))
          })

          if (resp.success) {
            // alert('Opgeslagen!')
            revenue.name = newLabel
            revenue.category = newCategory
            revenue.amount = +newAmount
            revenue.date = new Date(Date.parse(newDate))
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

  async delete(revenue: IJournalEntry) {
    const confirmed = confirm(`Weet je zeker dat je '${revenue.name}' wilt verwijderen?`)
    if (confirmed === true) {
      // try to update item !
      try {
        const resp = await this.journalApi.deleteEntry(revenue.id)

        if (resp.success) {
          // alert('Verwijderd!')
          this._revenues.splice(this._revenues.indexOf(revenue), 1)
        }
      } catch (err) {
        console.log(err)
        alert('Er is een onbekende fout opgetreden tijdens het behandelen van je verzoek!')
      } finally {
        this.ref.markForCheck()
      }
    }
  }

  get revenues(): IJournalEntry[] {
    return this._revenues
  }

  get culture(): string {
    return 'nl-BE'
  }
}
