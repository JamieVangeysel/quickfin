import { Component, OnInit } from '@angular/core'

@Component({
  selector: 'qf-modern-layout',
  templateUrl: './modern-layout.component.html',
  host: { class: 'relative flex flex-auto w-full' }
})
export class ModernLayoutComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
