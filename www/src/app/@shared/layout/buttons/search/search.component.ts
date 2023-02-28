import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core'
import { Router } from '@angular/router'
import { SearchService } from './search.service'

const revenue_categories = [
  'salaris',
  'maaltijdcheques',
  'terugbetaling',
  'dividenten',
  'flexi-job'
]

const expenses_categories = [
  'vaste kosten',
  'voeding',
  'woning',
  'brandstof',
  'online diensten',
  'shopping',
  'verzekering',
  'sparen',
  'investing',
  'sport',
  'gezondheid'
]

@Component({
  selector: 'qf-search',
  templateUrl: './search.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchComponent {
  query: string = ''
  lastEvent: string = ''

  public active: boolean = false
  public dropdownShown: boolean = false

  suggestions: ISuggestedAction[] = []

  constructor(
    private ref: ChangeDetectorRef,
    private searchService: SearchService,
    private router: Router
  ) {
    this.query = this.searchService.current
    this.lastEvent = this.query
    this.ref.markForCheck()

    this.searchService.change.subscribe(query => {
      if (query) {
        this.query = query
        this.ref.markForCheck()
      }
    })

    // document.addEventListener('keydown', (event) => {
    //   var name = event.key
    //   var code = event.code
    //   // Alert the key name and key code on keydown
    //   console.log(`Key pressed ${name} \r\n Key code value: ${code}`)
    // }, false)
  }

  private async updateSuggestions() {
    const query = this.query.toLocaleLowerCase()
    this.suggestions = []

    const url = this.router.url.split('?')[0]

    if (query.length > 0) {
      switch (url) {
        case '/revenue':
          if (query.length > 2) {
            revenue_categories.forEach(category => {
              if (category.includes(query)) {
                this.suggestions.push({
                  action: 'search',
                  text: `Toon alle inkomens met categorie '${category}'`,
                  query: 'category:' + category
                })
              }
            })
          }

          this.suggestions.push({
            action: 'search',
            text: `Zoek op '${query}' in jouw inkomens`,
            query: query
          })
          break

        case '/expenses':
          if (query.length > 2) {
            expenses_categories.forEach(category => {
              if (category.includes(query)) {
                this.suggestions.push({
                  action: 'search',
                  text: `Toon alle uitgaven met categorie '${category}'`,
                  query: 'category:' + category
                })
              }
            })
          }

          this.suggestions.push({
            action: 'search',
            text: `Zoek op '${query}' in jouw uitgaven`,
            query: query
          })
          break

        default:
          console.log(url)
          break
      }
    }

    if ('inkomen'.includes(query) && url !== '/revenue') {
      this.suggestions.push({
        action: 'route',
        text: 'Beheer Inkomen',
        route: '/revenue'
      })
    }

    if ('uitgaven'.includes(query) && url !== '/expenses') {
      this.suggestions.push({
        action: 'route',
        text: 'Beheer uitgaven',
        route: '/expenses'
      })
    }

    if (('begroting'.includes(query) || 'budget'.includes(query)) && url !== '/budget') {
      this.suggestions.push({
        action: 'route',
        text: 'Beheer begroting',
        route: '/budget'
      })
    }

    if ('activa'.includes(query) && url !== '/networth/assets') {
      this.suggestions.push({
        action: 'route',
        text: 'Beheer activa',
        route: '/networth/assets'
      })
    }

    if ('passiva'.includes(query) && url !== '/networth/liabilities') {
      this.suggestions.push({
        action: 'route',
        text: 'Beheer passiva',
        route: '/networth/liabilities'
      })
    }
  }

  doKeyDown($event: any) {
    if (!this.dropdownShown) {
      this.dropdownShown = true
    }
    if ($event.keyCode === 13) {
      this.search()
    }
  }

  doKeyUp($event: any) {
    if ($event && $event.keyCode !== 13) {
      this.updateSuggestions()
    }
  }

  close(): void {
    this.active = false
    this.ref.markForCheck()
  }

  toggle(): void {
    this.active = !this.active
  }

  search() {
    this.hideDropdown()
    if (this.lastEvent != this.query)
      this.searchService.set(this.query)
    this.lastEvent = this.query
    this.ref.markForCheck()
  }

  searchQuery(suggestion: ISuggestedAction): void {
    switch (suggestion.action) {
      case 'route':
        if (!suggestion.route) return

        this.router.navigate([suggestion.route], {
          queryParams: suggestion.params
        })
        this.hideDropdown()
        this.toggle()
        break

      case 'search':
        if (suggestion.query) {
          this.query = suggestion.query
          this.ref.markForCheck()
          this.search()
        }
        break

      default:
        console.error(`Unknown action: '${suggestion.action}'`)
        return
    }
  }

  hideDropdown() {
    setTimeout(() => {
      this.dropdownShown = false
      // this.updateSuggestions()
      this.ref.markForCheck()
    }, 80)
  }

  showDropdown() {
    this.dropdownShown = true

    if (this.suggestions.length === 0)
      this.updateSuggestions()
    this.ref.markForCheck()
  }
}

export interface ISuggestedAction {
  action: 'route' | 'search',
  text: string,
  query?: string
  route?: string,
  params?: any
}