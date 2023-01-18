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
      const journal = await this.journalApi.getEntries(0)
      if (journal) {
        this._expenses = journal.entries ?? []
      }
      console.log(this.expenses)
    } catch (err) {
      console.log(err)
    } finally {
      this.ref.markForCheck()
    }
  }

  get expenses(): IJournalEntry[] {
    return this._expenses
  }

  get culture(): string {
    return 'nl-BE'
  }
}
