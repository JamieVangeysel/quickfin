import { ChangeDetectionStrategy, ChangeDetectorRef, OnInit, Component } from '@angular/core'
import { BudgetApiService, IBudgetEntry, IPostResponse, IPutResponse, IYear } from 'src/app/api/budget-api.service';

@Component({
  selector: 'qf-budget-page',
  templateUrl: './budget-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'relative flex flex-auto w-full'
  }
})
export class BudgetPageComponent implements OnInit {
  _years: IYear[] = [{ year: new Date().getFullYear() }]
  _incomes: IBudgetEntry[] = []
  _expenses: IBudgetEntry[] = []

  constructor(
    private ref: ChangeDetectorRef,
    private budgetApi: BudgetApiService
  ) { }


  async ngOnInit() {
    try {
      const overview = await this.budgetApi.getOverview()
      if (overview) {
        this._incomes = overview.incomes ?? []
        this._expenses = overview.expenses ?? []
        this._years = overview.years ?? []
      }
    } catch (err) {
      console.log(err)
    } finally {
      this.ref.markForCheck()
    }
  }

  async create(type: 0 | 1) {
    const newLabel = prompt('Label: ')
    if (!newLabel) return
    const newValue = prompt('Waarde: ')
    if (!newValue) return

    if (+newValue >= 0 && newLabel.length > 0) {
      // try to create item !
      try {
        let resp: IPostResponse

        if (type === 0)
          resp = await this.budgetApi.createIncome({
            name: newLabel,
            value: +newValue,
            year: new Date().getFullYear()
          })
        else
          resp = await this.budgetApi.createExpense({
            name: newLabel,
            value: +newValue,
            year: new Date().getFullYear()
          })

        if (resp.success) {
          // alert('Aangemaakt!')

          const item = {
            id: resp.id,
            name: newLabel,
            value: +newValue,
            year: new Date().getFullYear()
          }

          if (type === 0)
            this._incomes.push(item)
          else
            this._expenses.push(item)
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

  async edit(type: 0 | 1, item: IBudgetEntry) {
    const newLabel = prompt('Nieuwe label: ', item.name)
    if (!newLabel) return
    const newValue = prompt('Nieuwe waarde: ', item.value.toString())
    if (!newValue) return

    if (+newValue >= 0) {
      if (newLabel === item.name && +newValue === item.value) {
        alert('Er zijn geen wijzigingen opgeslagen!')
      } else {
        // try to update item !
        try {
          let resp: IPutResponse

          if (type === 0)
            resp = await this.budgetApi.updateIncome({
              id: item.id,
              name: newLabel,
              value: +newValue,
              year: item.year
            })
          else
            resp = await this.budgetApi.updateExpense({
              id: item.id,
              name: newLabel,
              value: +newValue,
              year: item.year
            })

          if (resp.success) {
            // alert('Opgeslagen!')
            item.name = newLabel
            item.value = +newValue
          }
          console.log('Nieuwe waardes: ', newLabel, +newValue)
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

  async delete(type: 0 | 1, item: IBudgetEntry) {
    const confirmed = confirm(`Weet je zeker dat je '${item.name}' wilt verwijderen?`)
    if (confirmed === true) {
      // try to update item !
      try {
        let resp: IPostResponse

        if (type === 0)
          resp = await this.budgetApi.deleteIncome(item.id)
        else
          resp = await this.budgetApi.deleteExpense(item.id)

        if (resp.success) {
          // alert('Verwijderd!')
          if (type === 0)
            this._incomes.splice(this._incomes.indexOf(item), 1)
          else
            this._expenses.splice(this._expenses.indexOf(item), 1)
        }
      } catch (err) {
        console.log(err)
        alert('Er is een onbekende fout opgetreden tijdens het behandelen van je verzoek!')
      } finally {
        this.ref.markForCheck()
      }
    }
  }

  get GeustimatedGrowth(): number {
    return 0
  }

  get incomes(): IBudgetEntry[] {
    return this._incomes
  }

  get expenses(): IBudgetEntry[] {
    return this._expenses
  }

  get incomesValue(): number {
    return this._incomes.reduce((prev, curr) => prev + curr.value, 0)
  }

  get expensesValue(): number {
    return this._expenses.reduce((prev, curr) => prev + curr.value, 0)
  }

  get balance(): number {
    return this.incomesValue - this.expensesValue
  }

  get culture(): string {
    return 'nl-BE'
  }
}
