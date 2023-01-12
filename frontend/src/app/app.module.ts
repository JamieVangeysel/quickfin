import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { LayoutModule } from './@shared/layout/layout.module'

import { registerLocaleData } from '@angular/common'
import localeNlBe from '@angular/common/locales/nl-BE'

import { PagesRoutingModule } from './pages/pages-routing.module'
import { AppComponent } from './app.component'
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'
import { AuthInterceptor } from './auth/auth.interceptor'

registerLocaleData(localeNlBe)

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    LayoutModule,
    HttpClientModule,
    BrowserAnimationsModule,
    PagesRoutingModule
  ],
  providers: [{
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
