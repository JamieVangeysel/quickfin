import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import { environment } from 'src/environments/environment'

@Injectable({
  providedIn: 'root'
})
export class AnalyticsApiService {
  constructor(private http: HttpClient) { }

  get(): Promise<IGetAnalytics> {
    return firstValueFrom(this.http.get<IGetAnalytics>(`${environment.api}analytics`, { headers: { 'Authorization': 'yes' } }))
  }
}

export interface IGetAnalytics {
  collections: IGetAnalyticsCollection[]
}

export interface IGetAnalyticsCollection {
  name: string
  datasets: IGetAnalyticsDataset[]
}

export interface IGetAnalyticsDataset {
  name: string
  rows: any[]
}
