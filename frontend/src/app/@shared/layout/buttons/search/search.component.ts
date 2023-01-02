import { ChangeDetectionStrategy, Component } from '@angular/core'

@Component({
  selector: 'qf-search',
  templateUrl: './search.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchComponent {
  constructor() { }
}
