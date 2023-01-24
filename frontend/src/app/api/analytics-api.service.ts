import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import { environment } from 'src/environments/environment'

@Injectable({
  providedIn: 'root'
})
export class AnalyticsApiService {
  constructor(private http: HttpClient) { }

  get(): Promise<any> {
    return firstValueFrom(this.http.get<any>(`${environment.api}analytics`))
  }
}
