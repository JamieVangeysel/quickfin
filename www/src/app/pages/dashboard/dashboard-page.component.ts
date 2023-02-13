import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core'
import { ChartType } from 'ng-apexcharts'
import { AnalyticsApiService, IGetAnalytics } from 'src/app/api/analytics-api.service'
import { AuthService } from 'src/app/auth/auth.service'

const areaChartType: ChartType = 'area'
const donutChartType: ChartType = 'donut'
const barChartType: ChartType = 'bar'


const visitorsChart: any = {
  chart: {
    type: areaChartType,
    height: 320,
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
    show: true,
    borderColor: 'var(--border-color)',
    xaxis: {
      lines: {
        show: true
      }
    },
    yaxis: {
      lines: {
        show: true
      }
    }
  },
  legend: {
    show: false
  },
  stroke: {
    curve: 'smooth',
    width: 2,
    lineCap: 'round'
  },
  dataLabels: {
    enabled: false
  },
  fill: {
    gradient: {
      shade: 'dark',
      type: 'vertical',
      shadeIntensity: 0.5,
      gradientToColors: undefined,
      inverseColors: true,
      opacityFrom: 1,
      opacityTo: 0.5,
      stops: [0, 35, 100],
      colorStops: []
    },
  },
  tooltip: {
    enabled: true,
    fillSeriesColor: false,
    theme: 'dark',
    followCursor: true,
    onDatasetHover: {
      highlightDataSeries: false,
    },
    y: {
      formatter: function (value: number) {
        return '€ ' + value.toFixed(2)
      }
    }
  },
  xaxis: {
    type: 'datetime',
    // floating: true,
    labels: {
      show: true,
      offsetY: -16,
      //offsetX: -16
      style: {
        colors: '#999'
      }
    }
  },
  yaxis: {
    show: true,
    showAlways: true,
    floating: true,
    forceNiceScale: true,
    min: 0,
    labels: {
      show: true,
      // offsetX: -116
    },
    axisBorder: {
      show: true
    },
    axisTicks: {
      show: true
    }
  }
}
const demoGraphicTemplate = {
  name: 'Language',
  options: {
    series: [.8, .2],
    labels: ['Dutch', 'French'],
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
      colors: ['rgb(49, 130, 206)', 'rgb(99, 179, 237)']
    },
    stroke: {
      width: 2,
      colors: ['var(--bg-card)']
    },
    colors: ['rgb(49, 130, 206)', 'rgb(99, 179, 237)'],
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
          return value * 100 + "%"
        }
      }
    },
  },
  groups: [{
    label: 'Dutch',
    color: 'rgb(49, 130, 206)',
    value: '36,868',
    percentage: .8
  }, {
    label: 'French',
    color: 'rgb(99, 179, 237)',
    value: '9,217',
    percentage: .2,
  }]
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

@Component({
  selector: 'qf-dashboard-page',
  templateUrl: './dashboard-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'relative flex flex-auto w-full'
  }
})
export class DashboardPageComponent implements OnInit {
  statistics: any[] = []
  loading = true

  demoGraphics = [
    demoGraphicTemplate,
    demoGraphicTemplate,
    demoGraphicTemplate,
    demoGraphicTemplate
  ]

  activeSegment: 'current' | 'previous' = 'current'
  networth_history: any | undefined
  incomeVsBudget: any | undefined
  expensesVsBudget: any | undefined
  balanceVsNetworthDiff: any | undefined
  visitorsvsviews: any | undefined

  analytics: IGetAnalytics | undefined

  constructor(
    private ref: ChangeDetectorRef,
    private auth: AuthService,
    private analyticsApi: AnalyticsApiService
  ) {
  }
  async ngOnInit() {
    try {
      const analytics = await this.analyticsApi.get()
      this.analytics = analytics

      if (analytics) {
        console.log(analytics)

        const networth_history = analytics.collections.find(e => e.name === 'networth-history')
        const indicators = analytics.collections.find(e => e.name === 'indicators')

        console.log(networth_history)

        if (this.hasCurrentSegment && this.hasPreviousSegment) {

        } else if (this.hasCurrentSegment) {
          this.networth_history = {
            options: {
              ...visitorsChart,
              series: [{
                name: 'Netto-waarde historiek',
                data: networth_history?.datasets.find(e => e.name === 'current')?.rows.map(e => ({
                  x: new Date(e.date).getTime(),
                  y: e.value
                }))
              }]
            }
          }
        } else if (this.hasPreviousSegment) {

        } else {
          console.debug('There are segments, but none equal current or previous. Someone definetly made an oopsie.')
        }

        if (indicators) {
          const incomesCard = indicators.datasets.find(e => e.name === 'incomes-vs-budget')
          const expensesCard = indicators.datasets.find(e => e.name === 'expenses-vs-budget')
          const balanceCard = indicators.datasets.find(e => e.name === 'balance-vs-networth-diff')
          if (incomesCard) {
            const lastValue = incomesCard.rows[incomesCard.rows.length - 1]
            this.incomeVsBudget = {
              current: lastValue.value,
              result: 1 - (lastValue.value / lastValue.budget),
              pos: lastValue.value > lastValue.budget,
              options: {
                ...demoTriChart,
                colors: ['#34d399'],
                series: [{
                  name: 'Inkomen',
                  data: incomesCard.rows.map(e => ({
                    x: new Date(e.date).getTime(),
                    y: e.value
                  }))
                }],
              }
            }
          }
          if (expensesCard) {
            const lastValue = expensesCard.rows[expensesCard.rows.length - 1]
            this.expensesVsBudget = {
              current: lastValue.value,
              result: 1 - (lastValue.value / lastValue.budget),
              pos: lastValue.value > lastValue.budget,
              options: {
                ...demoTriChart,
                colors: ['#fb7185'],
                series: [{
                  name: 'Uitgaven',
                  data: expensesCard.rows.map(e => ({
                    x: new Date(e.date).getTime(),
                    y: e.value
                  }))
                }],
              }
            }
          }
          if (balanceCard) {
            const lastValue = balanceCard.rows[balanceCard.rows.length - 1]
            this.balanceVsNetworthDiff = {
              current: lastValue.value,
              result: lastValue.value,
              pos: 1,
              options: {
                ...demoTriChart,
                colors: ['#38bdf8'],
                series: [{
                  name: 'Nettowaarde verschil',
                  data: balanceCard.rows.map(e => ({
                    x: new Date(e.date).getTime(),
                    y: e.budget
                  }))
                }],
              }
            }
          }
        }
      }
    } catch (err: any) {
      console.error(err)
      alert(err.message)
    } finally {
      this.loading = false
      this.ref.markForCheck()
    }
  }

  activateSegment(segment: 'current' | 'previous') {
    try {

    } catch (err) {
    } finally {
      this.activeSegment = segment
      this.ref.markForCheck()
    }
  }

  get profile(): any {
    return this.auth.id_token
  }

  get hasCurrentSegment(): boolean {
    const networth_history = this.analytics?.collections.find(e => e.name === 'networth-history')
    const segments = networth_history?.datasets.map(e => e.name)
    return segments?.includes('current') || false
  }

  get hasPreviousSegment(): boolean {
    const networth_history = this.analytics?.collections.find(e => e.name === 'networth-history')
    const segments = networth_history?.datasets.map(e => e.name)
    return segments?.includes('previous') || false
  }

  get culture(): string {
    return 'nl-BE'
  }
}
