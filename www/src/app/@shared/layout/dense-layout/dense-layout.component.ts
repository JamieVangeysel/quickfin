import { Component, OnInit } from '@angular/core'

@Component({
  selector: 'qf-dense-layout',
  templateUrl: './dense-layout.component.html',
  host: { class: 'relative flex flex-auto w-full' }
})
export class DenseLayoutComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
