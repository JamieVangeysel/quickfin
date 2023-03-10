import { ThisReceiver } from '@angular/compiler'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
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
  private _forms: { [key: string]: FormGroup } = {}
  private _expenses: ListItem[] = []

  loading: boolean = true

  constructor(
    private ref: ChangeDetectorRef,
    private fb: FormBuilder,
    private journalApi: JournalApiService
  ) { }

  async ngOnInit() {
    try {
      this.loading = true
      this.ref.markForCheck()

      const journal = await this.journalApi.getEntries(false)
      if (journal) {
        journal.forEach(e => e.amount = Math.abs(e.amount))
        this._expenses = journal as ListItem[]
        this._expenses.forEach(e => e.editing = false)
      }
    } catch (err) {
      console.log(err)
    } finally {
      this.loading = false
      this.ref.markForCheck()
    }
  }

  edit(item: ListItem) {
    item.editing = !item.editing
    if (!this._forms[item.id]) {
      let date = item.date.toString().split('T')[0]
      if (item.date instanceof Date) {
        date = item.date.toISOString().split('T')[0]
      }
      this._forms[item.id] = this.fb.group({
        name: [item.name, [Validators.required]],
        category: [item.category, [Validators.required]],
        date: [date, [Validators.required, Validators.pattern('[0-9]{4}-[0-9]{2}-[0-9]{2}')]],
        amount: [item.amount, [Validators.required]],
        note: [item.note, []]
      })
    }
    this.ref.markForCheck()
  }

  beginCreate() {
    if (this.isCreating) return

    const item: ListItem = {
      id: 0,
      name: '',
      category: '',
      date: new Date(),
      amount: 0,
      note: undefined,
      editing: false
    }
    this._expenses.unshift(item)
    this.edit(item)
  }

  async save(expense: ListItem) {
    if (this._forms[expense.id].valid) {
      const formValue = this._forms[expense.id].value

      formValue.id = expense.id
      // make sure value is negative number
      formValue.amount = Math.abs(formValue.amount) * -1

      const response = expense.id > 0 ? await this.journalApi.updateEntry(formValue) : await this.journalApi.createEntry(formValue)
      console.log(response)

      if (!response.success) {
        alert('Uitgave niet opgeslagen !')
      } else {
        // success
        alert(expense.id > 0 ? 'Uitgave bijgewerkt !' : 'Uitgave aangemaakt !')

        if (expense.id === 0) {
          expense.id = response.id
        }
        expense.name = formValue.name
        expense.category = formValue.category
        expense.date = formValue.date
        expense.amount = Math.abs(formValue.amount) // revert to positive/absolute value
        expense.note = formValue.note?.length > 0 ? formValue.note : undefined

        this.ref.markForCheck()
      }
    } else {
      console.warn('form is invallid', this._forms[expense.id].value)
    }
  }

  async delete(expense: ListItem) {
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

  get isCreating(): boolean {
    return this._expenses.some(e => e.id === 0)
  }

  get expenses(): ListItem[] {
    return this._expenses
  }

  get expenseForm(): { [key: string]: FormGroup } {
    return this._forms
  }

  get culture(): string {
    return 'nl-BE'
  }
}
export interface IEditableRow {
  editing: boolean
}

interface ListItem extends IJournalEntry, IEditableRow { }
