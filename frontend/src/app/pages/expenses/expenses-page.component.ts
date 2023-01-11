import { ChangeDetectionStrategy, Component } from '@angular/core'

@Component({
  selector: 'qf-expenses-page',
  templateUrl: './expenses-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'relative flex flex-auto w-full'
  }
})
export class ExpensesPageComponent {

}
