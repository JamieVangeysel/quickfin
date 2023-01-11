import { ChangeDetectionStrategy, Component } from '@angular/core'

@Component({
  selector: 'qf-budget-page',
  templateUrl: './budget-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'relative flex flex-auto w-full'
  }
})
export class BudgetPageComponent {

}
