import { Component, OnInit } from '@angular/core'

@Component({
  selector: 'qf-compact-layout',
  templateUrl: './compact-layout.component.html',
  host: { class: 'relative flex flex-auto w-full' }
})
export class CompactLayoutComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
