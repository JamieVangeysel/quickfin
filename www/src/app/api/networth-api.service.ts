import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import { environment } from 'src/environments/environment'

@Injectable({
  providedIn: 'root'
})
export class NetworthApiService {
  constructor(private http: HttpClient) { }

  get(): Promise<IGetNetworthResponse> {
    return firstValueFrom(this.http.get<IGetNetworthResponse>(`${environment.api}networth`, { headers: { 'Authorization': 'yes' } }))
  }

  getOverview(): Promise<IGetNetworthOverviewResponse> {
    return firstValueFrom(this.http.get<IGetNetworthOverviewResponse>(`${environment.api}networth/overview`, { headers: { 'Authorization': 'yes' } }))
  }

  getAssets(): Promise<IGetNetworthAssetsResponse> {
    return firstValueFrom(this.http.get<IGetNetworthAssetsResponse>(`${environment.api}networth/assets`, { headers: { 'Authorization': 'yes' } }))
  }

  getLiabilities(): Promise<IGetNetworthLiabilitiesResponse> {
    return firstValueFrom(this.http.get<IGetNetworthLiabilitiesResponse>(`${environment.api}networth/liabilities`, { headers: { 'Authorization': 'yes' } }))
  }

  createAsset(asset: INameValueEntry): Promise<IPostResponse> {
    return firstValueFrom(this.http.post<IPostResponse>(`${environment.api}networth/assets`, asset, { headers: { 'Authorization': 'yes' } }))
  }

  updateAsset(asset: IGetNetworthEntry): Promise<IPostResponse> {
    return firstValueFrom(this.http.put<IPostResponse>(`${environment.api}networth/assets/${asset.id}`, asset, { headers: { 'Authorization': 'yes' } }))
  }

  deleteAsset(id: number): Promise<IPostResponse> {
    return firstValueFrom(this.http.delete<IPostResponse>(`${environment.api}networth/assets/${id}`, { headers: { 'Authorization': 'yes' } }))
  }

  createLiability(liability: INameValueEntry): Promise<IPostResponse> {
    return firstValueFrom(this.http.post<IPostResponse>(`${environment.api}networth/liabilities`, liability, { headers: { 'Authorization': 'yes' } }))
  }

  updateLiability(liability: IGetNetworthEntry): Promise<IPostResponse> {
    return firstValueFrom(this.http.put<IPostResponse>(`${environment.api}networth/liabilities/${liability.id}`, liability, { headers: { 'Authorization': 'yes' } }))
  }

  deleteLiability(id: number): Promise<IPostResponse> {
    return firstValueFrom(this.http.delete<IPostResponse>(`${environment.api}networth/liabilities/${id}`, { headers: { 'Authorization': 'yes' } }))
  }
}

export interface IGetNetworthResponse {
  value: number
}

export interface IGetNetworthOverviewResponse {
  assets: INameValueEntry[],
  liabilities: INameValueEntry[]
  history: {
    date: Date,
    value: number
  }[]
}

export interface IGetNetworthAssetsResponse {
  groups: IAssetsGroup[]
}

export interface IGetNetworthLiabilitiesResponse {
  groups: ILiabilitiesGroup[]
}

export interface IAssetsGroup {
  id: number,
  name: string,
  assets: IGetNetworthEntry[]
}

export interface ILiabilitiesGroup {
  id: number,
  name: string,
  liabilities: IGetNetworthEntry[]
}

export interface IGetNetworthEntry {
  id: number,
  name: string,
  value: number,
  group_id?: number
}

export interface INameValueEntry {
  name: string,
  value: number,
  group_id?: number
}

export interface IPostResponse extends IPutResponse {
  id: number
}

export interface IPutResponse {
  success: boolean
}