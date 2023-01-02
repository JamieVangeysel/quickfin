import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'
import { Subscription } from 'rxjs'
import { AuthService } from 'src/app/auth/auth.service'

@Component({
  selector: 'qf-classy-layout',
  templateUrl: './classy-layout.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'relative flex flex-auto w-full' }
})
export class ClassyLayoutComponent implements OnInit, OnDestroy {
  private $sub: Subscription | undefined

  constructor(
    private ref: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private auth: AuthService
  ) { }

  ngOnInit() {
    this.$sub = this.auth.change.subscribe(() => {
      this.ref.markForCheck()
    })
  }

  ngOnDestroy() {
    this.$sub?.unsubscribe()
  }

  get avatar(): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.auth.id_token?.picture)
  }

  get displayName(): string {
    return this.auth.id_token?.name
  }

  get email(): string {
    return this.auth.id_token?.email
  }
}
