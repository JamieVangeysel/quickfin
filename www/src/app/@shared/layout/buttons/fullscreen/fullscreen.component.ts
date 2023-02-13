import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core'

@Component({
  selector: 'qf-fullscreen',
  templateUrl: './fullscreen.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FullscreenComponent {
  constructor(
    private ref: ChangeDetectorRef
  ) { }

  enterFullscreen(): void {
    const document: any = window.document
    const element: any = document.documentElement

    if (!this.isFullScreen) {
      if (element.requestFullscreen)
        element.requestFullscreen({ navigationUI: 'show' })
      else if (element.webkitRequestFullScreen)
        element.webkitRequestFullScreen({ navigationUI: 'show' })
    } else {
      if (document.exitFullscreen)
        document.exitFullscreen()
      else if (document['webkitExitFullscreen'])
        document['webkitExitFullscreen']()
      else if (document['mozCancelFullScreen'])
        document['mozCancelFullScreen']()
      else if (document['msExitFullscreen'])
        document['msExitFullscreen']()
    }

    setTimeout(() => {
      this.ref.markForCheck()
    }, 16)
  }

  get isFullScreen(): boolean {
    const document: any = window.document
    return (document.fullscreenElement && document.fullscreenElement !== null) ||
      (document['webkitFullscreenElement'] && document['webkitFullscreenElement'] !== null) ||
      (document['mozFullScreenElement'] && document['mozFullScreenElement'] !== null) ||
      (document['msFullscreenElement'] && document['msFullscreenElement'] !== null)
  }
}
