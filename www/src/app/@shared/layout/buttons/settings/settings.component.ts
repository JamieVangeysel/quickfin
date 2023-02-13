import { Component, OnInit } from '@angular/core'
import { LayoutService, Layout } from '../../layout.service'

@Component({
  selector: 'qf-settings',
  templateUrl: './settings.component.html',
  host: {
    class: 'static block flex-none w-auto'
  }
})
export class SettingsComponent implements OnInit {

  constructor(
    private layoutService: LayoutService
  ) { }

  ngOnInit(): void {
  }

  setLayout(layout: string): void {
    this.layoutService.setLayout(layout as Layout)
  }

  isCurrent(layout: string): boolean {
    return layout === this.layoutService.current
  }
}
