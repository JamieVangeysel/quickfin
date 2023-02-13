import { EventEmitter, Injectable } from '@angular/core'

const LAYOUT_STORAGE_KEY = 'be.quickfin.layout'

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  private _layout: Layout = 'empty'

  layoutChange: EventEmitter<Layout> = new EventEmitter<Layout>()

  constructor() {
    if (window.localStorage.getItem(LAYOUT_STORAGE_KEY)) {
      const stored_value = window.localStorage.getItem(LAYOUT_STORAGE_KEY)?.toLowerCase() ?? 'empty'
      if (stored_value) {
        this._layout = stored_value as Layout
        console.log('layout ok', this._layout)
      } else this.loadDefault()
    } else this.loadDefault()

    this.layoutChange.emit(this._layout)
    this.layoutChange.subscribe(layout => {
      this._layout = layout
      window.localStorage.setItem(LAYOUT_STORAGE_KEY, `${layout}`)
    })
  }

  private loadDefault(): void {
    this._layout = 'enterprise'
  }

  get current(): Layout {
    return this._layout
  }

  setLayout(layout: Layout): void {
    this.layoutChange.emit(layout)
  }
}

export type Layout = 'centered' | 'classic' | 'classy' | 'compact' | 'dense' | 'empty' | 'enterprise' | 'futuristic' | 'material' | 'modern' | 'thin'