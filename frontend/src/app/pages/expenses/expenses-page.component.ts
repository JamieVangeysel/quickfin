import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core'
import { IJournalEntry, JournalApiService } from 'src/app/api/journal-api.service'

@Component({
  selector: 'qf-expenses-page',
  templateUrl: './expenses-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'relative flex flex-auto w-full'
  }
})
export class ExpensesPageComponent {
  private _expenses: IJournalEntry[] = []

  constructor(
    private ref: ChangeDetectorRef,
    private journalApi: JournalApiService
  ) { }

  async ngOnInit() {
    try {
      const journal = await this.journalApi.getEntries(false)
      if (journal) {
        this._expenses = journal ?? []
        this._expenses.forEach(e => e.amount = Math.abs(e.amount))
      }
      console.log(this.expenses)
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
          amount: +newAmount * -1,
          date: new Date(Date.parse(newDate))
        })

        if (resp.success) {
          // alert('Aangemaakt!')

          if (!this._expenses) this._expenses = []
          if (this._expenses) {
            this._expenses.push({
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

  async edit(expense: IJournalEntry) {
    const newLabel = prompt('Nieuwe label: ', expense.name)
    if (!newLabel) return
    const newCategory = prompt('Nieuwe categorie: ', expense.category)
    if (!newCategory) return
    const newDate = prompt('Nieuwe datum: ', `${expense.date.toString().split('T')[0]}`)
    if (!newDate) return
    const newAmount = prompt('Nieuwe waarde: ', expense.amount.toString())
    if (!newAmount) return

    if (+newAmount >= 0) {
      if (newLabel === expense.name && newCategory === expense.category && +newAmount === expense.amount && newDate.match('[0-9]{4}-[0-9]{2}-[0-9]{2}')) {
        alert('Er zijn geen wijzigingen opgeslagen!')
      } else {
        // try to update item !
        try {
          const resp = await this.journalApi.updateEntry({
            id: expense.id,
            name: newLabel,
            category: newCategory,
            amount: +newAmount * -1,
            date: new Date(Date.parse(newDate))
          })

          if (resp.success) {
            // alert('Opgeslagen!')
            expense.name = newLabel
            expense.category = newCategory
            expense.amount = +newAmount
            expense.date = new Date(Date.parse(newDate))
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

  async delete(expense: IJournalEntry) {
    const confirmed = confirm(`Weet je zeker dat je '${expense.name}' wilt verwijderen?`)
    if (confirmed === true) {
      // try to update item !
      try {
        const resp = await this.journalApi.deleteEntry(expense.id)

        if (resp.success) {
          // alert('Verwijderd!')
          this._expenses.splice(this._expenses.indexOf(expense), 1)
        }
      } catch (err) {
        console.log(err)
        alert('Er is een onbekende fout opgetreden tijdens het behandelen van je verzoek!')
      } finally {
        this.ref.markForCheck()
      }
    }
  }

  get expenses(): IJournalEntry[] {
    return this._expenses
  }

  get culture(): string {
    return 'nl-BE'
  }
}
