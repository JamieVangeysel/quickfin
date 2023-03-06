import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import { environment } from 'src/environments/environment'

@Injectable({
  providedIn: 'root'
})
export class StockApiService {
  constructor(private http: HttpClient) { }

  getStocks(): Promise<IGetStocksResponse> {
    return firstValueFrom(this.http.get<IGetStocksResponse>(`${environment.api}stock/positions`, { headers: { 'Authorization': 'yes' } }))
  }

  createStock(stock: IWStockEntry): Promise<IPostResponse> {
    return firstValueFrom(this.http.post<IPostResponse>(`${environment.api}stock/positions`, stock, { headers: { 'Authorization': 'yes' } }))
  }

  updateStock(stock: IStockEntry): Promise<IPostResponse> {
    return firstValueFrom(this.http.put<IPostResponse>(`${environment.api}stock/positions/${stock.id}`, stock, { headers: { 'Authorization': 'yes' } }))
  }

  deleteStock(id: number): Promise<IPostResponse> {
    return firstValueFrom(this.http.delete<IPostResponse>(`${environment.api}stock/positions/${id}`, { headers: { 'Authorization': 'yes' } }))
  }
}

export interface IGetStocksResponse {
  stocks: IStockEntry[]
}

export interface IWStockEntry {
  date: Date
  ticker: string,
  amount: number,
  value: number,
  currency: 'usd' | 'gbp' | 'eur',
  note?: string
}

export interface IStockEntry extends IWStockEntry {
  id: number
}

export interface IPostResponse extends IPutResponse {
  id: number
}

export interface IPutResponse {
  success: boolean
}