import { CurrencyPipe } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core'
import { ChartType } from 'ng-apexcharts'
import { NetworthApiService } from 'src/app/api/networth-api.service'

const areaChartType: ChartType = 'area'
const donutChartType: ChartType = 'donut'
const demoGraphicTemplate = {
  series: [.8, .2],
  // labels: ['Dutch', 'French'],
  chart: {
    type: donutChartType,
    width: '100%',
    height: 200,
    parentHeightOffset: 0,
    animations: {
      enabled: false
    },
    selection: {
      enabled: false
    }
  },
  legend: {
    show: false
  },
  dataLabels: {
    enabled: false
  },
  states: {
    hover: {
      filter: {
        type: 'none'
      }
    }
  },
  plotOptions: {
    pie: {
      expandOnClick: false,
      donut: {
        size: '70%'
      }
    }
  },
  fill: {
    type: 'solid',
    // colors: ['rgb(49, 130, 206)', 'rgb(99, 179, 237)']
  },
  stroke: {
    width: 2,
    colors: ['var(--bg-card)']
  },
  // colors: ['rgb(49, 130, 206)', 'rgb(99, 179, 237)'],
  responsive: [
    {
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        }
      }
    }
  ],
  tooltip: {
    enabled: true,
    fillSeriesColor: false,
    onDatasetHover: {
      highlightDataSeries: false,
    },
    y: {
      formatter: function (value: number) {
        return value.toFixed(2)
      }
    }
  }
}
const demoTriChart = {
  chart: {
    type: areaChartType,
    height: 80,
    parentHeightOffset: 0,
    toolbar: {
      show: false
    },
    zoom: {
      enabled: false
    },
    selection: {
      enabled: false
    },
    sparkline: {
      enabled: true
    }
  },
  grid: {
    show: false
  },
  legend: {
    show: false
  },
  stroke: {
    curve: 'smooth',
    lineCap: 'round'
  },
  dataLabels: {
    enabled: false
  },
  tooltip: {
    enabled: true,
    fillSeriesColor: false,
    theme: 'dark',
    followCursor: true,
    onDatasetHover: {
      highlightDataSeries: false,
    }
  },
  xaxis: {
    type: 'datetime',
    labels: {
      show: false
    },
    axisBorder: {
      show: false
    },
    axisTicks: {
      show: false
    }
  },
  yaxis: {
    labels: {
      show: false
    },
    axisBorder: {
      show: false
    },
    axisTicks: {
      show: false
    }
  }
}
const revenueColors = ['#a6c36f', '#cadba9', '#859c59', '#b8cf8c', '#647543']

@Component({
  selector: 'qf-overview-page',
  templateUrl: './overview-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'relative flex flex-auto w-full'
  }
})
export class OverviewPageComponent implements OnInit {
  private _assets: any[] = []
  private _liabilities: any[] = []

  diff: number = 0
  item: any
  history: any
  stocks: any[] = []

  constructor(
    private ref: ChangeDetectorRef,
    private networthApi: NetworthApiService,
    private currencyPipe: CurrencyPipe
  ) {
  }

  async ngOnInit() {
    try {
      const overview = await this.networthApi.getOverview()
      if (overview) {
        this._assets = overview.assets ?? []
        this._liabilities = overview.liabilities ?? []

        if (this.liabilities.length > 0 || this.assets.length > 0) {
          const firstValue = overview.history[0].value
          const currentValue = this.networth

          this.diff = 1 - currentValue / firstValue

          if (!overview.history) {
            overview.history = []
          }
          overview.history.push({
            date: new Date(),
            value: currentValue
          })
        }

        this.history = {
          ...demoTriChart,
          colors: ['#38bdf8'],
          series: [{
            name: 'Nettowaarde',
            data: overview.history.map(e => ({
              x: new Date(e.date).getTime(),
              y: e.value.toFixed(2)
            }))
          }]
        }

        const groups = this._assets.reduce((group, asset) => {
          const { category } = asset
          group[category] = group[category] ?? []
          group[category].push(asset)
          return group
        }, {})

        this.item = {
          ...demoGraphicTemplate,
          labels: Object
            .keys(groups),
          series: Object
            .keys(groups)
            .map((e: any) => groups[e].reduce((prev: number, curr: any) => prev + curr.value, 0)),
          colors: revenueColors,
          groups: Object.keys(groups).map((e, i) => ({
            label: groups[e][0].category,
            color: revenueColors[i],
            value: groups[e].reduce((prev: number, curr: any) => prev + curr.value, 0)
          })),
          tooltip: {
            enabled: true,
            fillSeriesColor: false,
            onDatasetHover: {
              highlightDataSeries: false,
            },
            y: {
              formatter: (value: number) => {
                return this.currencyPipe.transform(value, 'EUR', 'symbol-narrow', '1.2-2', this.culture)
              }
            }
          }
        }
      }
    } catch (err) {
      console.log(err)
    } finally {
      this.ref.markForCheck()
    }
  }

  resolveIcon(name: string, fallback: string): string {
    name = name.toLocaleLowerCase()

    if (['huis', 'woning', 'home', 'house', 'mortage', 'hypotheek'].some(e => name.includes(e))) {
      return 'fa-home'
    } else if (['sparen', 'spaar', 'pensioen', 'pension'].some(e => name.includes(e))) {
      return 'fa-piggy-bank'
    } else if (['invest'].some(e => name.includes(e))) {
      return 'fa-vault'
    } else if (['rekening'].some(e => name.includes(e))) {
      return 'fa-landmark'
    } else if (['cash', 'geld'].some(e => name.includes(e))) {
      return 'fa-coins'
    } else if (['rechtzaak', 'schulden', 'bemiddel', 'debt', 'loan'].some(e => name.includes(e))) {
      return 'fa-balance-scale'
    } else if (['mastercard'].some(e => name.includes(e))) {
      return 'fab fa-cc-mastercard'
    } else if (['visa'].some(e => name.includes(e))) {
      return 'fab fa-cc-visa'
    } else if (['paypal'].some(e => name.includes(e))) {
      return 'fab fa-cc-paypal'
    } else if (['auto', 'car'].some(e => name.includes(e))) {
      return 'fa-car'
    } else if (['bike', 'motor'].some(e => name.includes(e))) {
      return 'fa-motorcycle'
    } else if (['bicycle', 'fiets'].some(e => name.includes(e))) {
      return 'fa-bicycle'
    }

    return fallback
  }

  get diffAbs(): number {
    return Math.abs(this.diff)
  }

  get historyClass(): string {
    return this.diff > 0 ? 'text-red-500 fa-chart-line-down' : 'text-green-500 fa-chart-line'
  }

  get assets(): any[] {
    return this._assets
  }

  get liabilities(): any[] {
    return this._liabilities
  }

  get assetsValue(): number {
    return this._assets.reduce((prev, curr) => prev + curr.value, 0)
  }

  get liabilitiesValue(): number {
    return this._liabilities.reduce((prev, curr) => prev + curr.value, 0)
  }

  get networth(): number {
    return this.assetsValue - this.liabilitiesValue
  }

  get today(): Date {
    return new Date()
  }

  get culture(): string {
    return 'nl-BE'
  }
}
