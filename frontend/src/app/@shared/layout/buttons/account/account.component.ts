import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'
import { AuthService } from 'src/app/auth/auth.service'
import { LayoutService } from '../../layout.service'

@Component({
  selector: 'qf-account',
  templateUrl: './account.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountComponent {

  constructor(
    private ref: ChangeDetectorRef,
    private auth: AuthService,
    private sanitizer: DomSanitizer,
    private layout: LayoutService
  ) {
    this.auth.change.subscribe(provider => {
      this.ref.markForCheck()
    })
  }

  logout(): void {
    this.auth.logout()
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

  get showAvatar(): boolean {
    return !(['futuristic', 'classy'].includes(this.layout.current))
  }
}
