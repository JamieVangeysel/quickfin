import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core'
import { ApexChart, ApexDataLabels, ApexFill, ApexGrid, ApexLegend, ApexStroke, ApexTooltip, ApexXAxis, ApexYAxis, ChartType } from 'ng-apexcharts'
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
      stops: [0, 50, 100],
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
  visitors: any | undefined
  users: any | undefined
  impressions: any | undefined
  registrations: any | undefined
  visitorsvsviews: any | undefined

  constructor(
    private ref: ChangeDetectorRef,
    private auth: AuthService,
    // private analytics: AnalyticsApiService
  ) {
  }
  async ngOnInit() {
    try {
      //const analytics = await this.analytics.getDashboard()
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
}
