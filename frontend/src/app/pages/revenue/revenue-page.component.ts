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
  private _revenue: IJournalEntry[] = []

  constructor(
    private ref: ChangeDetectorRef,
    private journalApi: JournalApiService
  ) { }

  async ngOnInit() {
    try {
      const journal = await this.journalApi.getEntries(true)
      if (journal) {
        this._revenue = journal.entries ?? []
      }
      console.log(this.expenses)
    } catch (err) {
      console.log(err)
    } finally {
      this.ref.markForCheck()
    }
  }

  get expenses(): IJournalEntry[] {
    return this._revenue
  }

  get culture(): string {
    return 'nl-BE'
  }
}
