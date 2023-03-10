import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { LayoutComponent } from './layout.component'
import { SharedModule } from '../@shared.module'
import { EmptyLayoutComponent } from './empty-layout/empty-layout.component'
import { CenteredLayoutComponent } from './centered-layout/centered-layout.component'
import { EnterpriseLayoutComponent } from './enterprise-layout/enterprise-layout.component'
import { ModernLayoutComponent } from './modern-layout/modern-layout.component'
import { DenseLayoutComponent } from './dense-layout/dense-layout.component'
import { ClassicLayoutComponent } from './classic-layout/classic-layout.component'
import { ClassyLayoutComponent } from './classy-layout/classy-layout.component'
import { CompactLayoutComponent } from './compact-layout/compact-layout.component'
import { FuturisticLayoutComponent } from './futuristic-layout/futuristic-layout.component'
import { MaterialLayoutComponent } from './material-layout/material-layout.component'
import { ThinLayoutComponent } from './thin-layout/thin-layout.component'
import { MatMenuModule } from '@angular/material/menu'
import { FooterComponent } from './footer/footer.component'
import { SettingsComponent } from './buttons/settings/settings.component'
import { FullscreenComponent } from './buttons/fullscreen/fullscreen.component'
import { LanguagesComponent } from './buttons/languages/languages.component'
import { SearchComponent } from './buttons/search/search.component'
import { MessagesComponent } from './buttons/messages/messages.component'
import { BookmarksComponent } from './buttons/bookmarks/bookmarks.component'
import { NotificationsComponent } from './buttons/notifications/notifications.component'
import { AccountComponent } from './buttons/account/account.component'
import { HorizontalNavigationComponent } from './navigation/horizontal-navigation/horizontal-navigation.component'
import { VerticalNavigationComponent } from './navigation/vertical-navigation/vertical-navigation.component'
import { VerticalNavigationGroupItemComponent } from './navigation/vertical-navigation-group-item/vertical-navigation-group-item.component'
import { VerticalNavigationAsideItemComponent } from './navigation/vertical-navigation-aside-item/vertical-navigation-aside-item.component'
import { RouterModule } from '@angular/router'
import { FormsModule } from '@angular/forms'

@NgModule({
  declarations: [
    LayoutComponent,
    CenteredLayoutComponent,
    ClassicLayoutComponent,
    ClassyLayoutComponent,
    CompactLayoutComponent,
    DenseLayoutComponent,
    EmptyLayoutComponent,
    EnterpriseLayoutComponent,
    FuturisticLayoutComponent,
    MaterialLayoutComponent,
    ModernLayoutComponent,
    ThinLayoutComponent,
    FooterComponent,
    SettingsComponent,
    FullscreenComponent,
    LanguagesComponent,
    SearchComponent,
    MessagesComponent,
    BookmarksComponent,
    NotificationsComponent,
    AccountComponent,
    HorizontalNavigationComponent,
    VerticalNavigationComponent,
    VerticalNavigationGroupItemComponent,
    VerticalNavigationAsideItemComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    MatMenuModule,
    RouterModule
  ],
  exports: [
    LayoutComponent
  ]
})
export class LayoutModule { }
