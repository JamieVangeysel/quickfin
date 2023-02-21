import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
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
  private _forms: { [key: string]: FormGroup } = {}
  private _revenues: ListItem[] = []

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

      const journal = await this.journalApi.getEntries(true)
      if (journal) {
        journal.forEach(e => e.amount = Math.abs(e.amount))
        this._revenues = journal as ListItem[]
        this._revenues.forEach(e => e.editing = false)
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
    this._revenues.unshift(item)
    this.edit(item)
  }

  async save(revenue: ListItem) {
    if (this._forms[revenue.id].valid) {
      const formValue = this._forms[revenue.id].value

      formValue.id = revenue.id
      // make sure value is positive number
      formValue.amount = Math.abs(formValue.amount)

      const response = revenue.id > 0 ? await this.journalApi.updateEntry(formValue) : await this.journalApi.createEntry(formValue)

      if (!response.success) {
        alert('Inkomen niet opgeslagen !')
      } else {
        // success
        alert(revenue.id > 0 ? 'Inkomen bijgewerkt !' : 'Inkomen aangemaakt !')

        if (revenue.id === 0) {
          revenue.id = response.id
        }
        revenue.name = formValue.name
        revenue.category = formValue.category
        revenue.date = formValue.date
        revenue.amount = Math.abs(formValue.amount) // revert to positive/absolute value
        revenue.note = formValue.note.length > 0 ? formValue.note : undefined

        this.ref.markForCheck()
      }
    } else {
      console.warn('form is invallid', this._forms[revenue.id].value)
    }
  }

  async delete(revenue: ListItem) {
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

  get isCreating(): boolean {
    return this._revenues.some(e => e.id === 0)
  }

  get revenues(): ListItem[] {
    return this._revenues
  }

  get revenueForm(): { [key: string]: FormGroup } {
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