import { ChangeDetectionStrategy, ChangeDetectorRef, OnInit, Component } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { BudgetApiService, IBudgetEntry, IPostResponse, IPutResponse, IYear } from 'src/app/api/budget-api.service'

@Component({
  selector: 'qf-budget-page',
  templateUrl: './budget-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'relative flex flex-auto w-full'
  }
})
export class BudgetPageComponent implements OnInit {
  private _years: IYear[] = [{ year: new Date().getFullYear() }]

  private _forms: { [key: string]: FormGroup } = {}

  private _incomes: ListItem[] = []
  private _expenses: ListItem[] = []

  constructor(
    private fb: FormBuilder,
    private ref: ChangeDetectorRef,
    private budgetApi: BudgetApiService
  ) { }

  async ngOnInit() {
    try {
      const overview = await this.budgetApi.getOverview()
      if (overview) {

        this._incomes = (overview.incomes ?? []) as ListItem[]
        this._incomes.forEach(e => e.editing = false)
        this._expenses = (overview.expenses ?? []) as ListItem[]
        this._expenses.forEach(e => e.editing = false)

        this._years = overview.years ?? []
      }
    } catch (err) {
      console.log(err)
    } finally {
      this.ref.markForCheck()
    }
  }

  edit(type: 0 | 1, item: ListItem) {
    item.editing = !item.editing

    if (!this._forms[`${type}-${item.id}`]) {
      this._forms[`${type}-${item.id}`] = this.fb.group({
        name: [item.name, [Validators.required]],
        value: [item.value, [Validators.required]]
      })
    }

    this.ref.markForCheck()
  }

  beginCreate(type: 0 | 1) {
    if ((type === 0 && this.isCreatingIncome) || (type === 1 && this.isCreatingExpense)) return

    const item: ListItem = {
      id: 0,
      name: '',
      value: 0,
      year: new Date().getFullYear(),
      editing: false
    }

    if (type === 0)
      this._incomes.unshift(item)
    else
      this._expenses.unshift(item)

    this.edit(type, item)
  }

  async save(type: 0 | 1, item: ListItem) {
    if (this._forms[`${type}-${item.id}`].valid) {
      const formValue = this._forms[item.id].value

      formValue.id = item.id
      // make sure value is positive number
      formValue.amount = Math.abs(formValue.amount)

      let response: IPostResponse
      if (type === 0)
        response = item.id > 0 ?
          await this.budgetApi.updateIncome(formValue) :
          await this.budgetApi.createIncome(formValue)
      else
        response = item.id > 0 ?
          await this.budgetApi.updateExpense(formValue) :
          await this.budgetApi.createExpense(formValue)

      if (!response.success) {
        alert('Niet opgeslagen !')
      } else {
        // success
        if (type === 0)
          alert(item.id > 0 ? 'Inkomen bijgewerkt !' : 'Inkomen aangemaakt !')
        else
          alert(item.id > 0 ? 'Uitgave bijgewerkt !' : 'Uitgave aangemaakt !')

        if (item.id === 0) {
          item.id = response.id
        }
        item.name = formValue.name
        item.value = formValue.value

        this.ref.markForCheck()
      }
    } else {
      console.warn('form is invallid', this._forms[item.id].value)
    }
  }

  async delete(type: 0 | 1, item: ListItem) {
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

  get isCreatingIncome(): boolean {
    return this._incomes.some(e => e.id === 0)
  }

  get isCreatingExpense(): boolean {
    return this._expenses.some(e => e.id === 0)
  }

  get incomes(): ListItem[] {
    return this._incomes
  }

  get expenses(): ListItem[] {
    return this._expenses
  }

  get incomesValue(): number {
    return this._incomes.reduce((prev, curr) => prev + curr.value, 0)
  }

  get expensesValue(): number {
    return this._expenses.reduce((prev, curr) => prev + curr.value, 0)
  }

  get form(): { [key: string]: FormGroup } {
    return this._forms
  }

  get balance(): number {
    return this.incomesValue - this.expensesValue
  }

  get culture(): string {
    return 'nl-BE'
  }
}

export interface IEditableRow {
  editing: boolean
}

interface ListItem extends IBudgetEntry, IEditableRow { }