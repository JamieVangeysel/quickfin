import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core'

@Component({
  selector: 'qf-search',
  templateUrl: './search.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchComponent {
  public active: boolean = false

  constructor(
    private ref: ChangeDetectorRef
  ) { }

  close(): void {
    this.active = false
    this.ref.markForCheck()
  }

  toggle(): void {
    this.active = !this.active
  }
}
