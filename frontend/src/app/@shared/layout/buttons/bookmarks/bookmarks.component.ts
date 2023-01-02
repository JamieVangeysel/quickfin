import { ChangeDetectionStrategy, Component } from '@angular/core'

@Component({
  selector: 'qf-bookmarks',
  templateUrl: './bookmarks.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookmarksComponent {
  constructor() { }
}
