import { Component, OnInit } from '@angular/core'

@Component({
  selector: 'qf-centered-layout',
  templateUrl: './centered-layout.component.html',
  host: { class: 'relative flex flex-auto w-full' }
})
export class CenteredLayoutComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
}
