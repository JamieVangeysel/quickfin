import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { IStockEntry, StockApiService } from 'src/app/api/stocks-api.service'

@Component({
  selector: 'qf-stocks',
  templateUrl: './stocks-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'relative flex flex-auto w-full'
  }
})
export class StocksPageComponent {
  private _forms: { [key: string]: FormGroup } = {}
  private _stocks: any[] = []

  loading = true

  constructor(
    private fb: FormBuilder,
    private ref: ChangeDetectorRef,
    private stockApi: StockApiService
  ) { }

  async ngOnInit() {
    try {
      this.loading = true
      this.ref.markForCheck()

      const response = await this.stockApi.getStocks()
      if (response) {
        this._stocks = (response.stocks ?? []) as ListItem[]
        this._stocks.forEach(e => e.editing = false)
      }
    } catch (err) {
      console.log(err)
    } finally {
      this.loading = false
      this.ref.markForCheck()
    }
  }

  export(): void {

  }

  edit(item: ListItem) {
    item.editing = !item.editing
    if (!this._forms[item.id]) {
      let date = item.date.toString().split('T')[0]
      if (item.date instanceof Date) {
        date = item.date.toISOString().split('T')[0]
      }
      this._forms[item.id] = this.fb.group({
        ticker: [item.ticker, [Validators.required, Validators.pattern('[A-Z]+(.[A-Z]+)?')]],
        amount: [item.amount, [Validators.required]],
        value: [item.value, [Validators.required]],
        date: [date, [Validators.required, Validators.pattern('[0-9]{4}-[0-9]{2}-[0-9]{2}')]],
        currency: [item.currency, [Validators.required, Validators.pattern('[EUR]|[GBP]|[USD]')]],
        note: [item.note, []]
      })
    } else {
      this._forms[item.id].reset()
    }
    this.ref.markForCheck()
  }

  beginCreate() {
    if (this.isCreating) return

    const item: ListItem = {
      id: 0,
      ticker: '',
      value: 0,
      date: new Date(),
      amount: 0,
      currency: '',
      note: undefined,
      editing: false
    }
    this._stocks.unshift(item)
    this.edit(item)
  }

  async save(stock: ListItem) {
    if (this._forms[stock.id].valid) {
      const formValue = this._forms[stock.id].value

      formValue.id = stock.id
      // make sure value is negative number
      formValue.amount = Math.abs(formValue.amount) * -1

      const response = stock.id > 0 ? await this.stockApi.updateStock(formValue) : await this.stockApi.createStock(formValue)
      console.log(response)

      if (!response.success) {
        alert('Stock niet opgeslagen !')
      } else {
        // success
        alert(stock.id > 0 ? 'Stock bijgewerkt !' : 'Stock aangemaakt !')

        if (stock.id === 0) {
          stock.id = response.id
        }
        stock.date = formValue.date
        stock.ticker = formValue.name
        stock.amount = formValue.amount
        stock.value = formValue.value
        stock.currency = formValue.curreny
        stock.note = formValue.note?.length > 0 ? formValue.note : undefined

        this.ref.markForCheck()
      }
    } else {
      console.warn('form is invallid', this._forms[stock.id].value, this._forms[stock.id].errors)
    }
  }

  async delete(stock: ListItem) {
    const confirmed = confirm(`Weet je zeker dat je '${stock.ticker}' wilt verwijderen?`)
    if (confirmed === true) {
      // try to update item !
      try {
        const resp = await this.stockApi.deleteStock(stock.id)

        if (resp.success) {
          // alert('Verwijderd!')
          this._stocks.splice(this._stocks.indexOf(stock), 1)
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
    return this._stocks.some(e => e.id === 0)
  }

  get stocks(): ListItem[] {
    return this._stocks
  }

  get stockForm(): { [key: string]: FormGroup } {
    return this._forms
  }

  get culture(): string {
    return 'nl-BE'
  }
}

export interface IEditableRow {
  editing: boolean
}

interface ListItem extends IStockEntry, IEditableRow { }
