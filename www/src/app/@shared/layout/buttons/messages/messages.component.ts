import { ChangeDetectionStrategy, Component } from '@angular/core'

@Component({
  selector: 'qf-messages',
  templateUrl: './messages.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessagesComponent {
  constructor() { }
}
