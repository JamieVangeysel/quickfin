import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import { environment } from 'src/environments/environment'

@Injectable({
  providedIn: 'root'
})
export class JournalApiService {
  constructor(private http: HttpClient) { }

  getEntries(direction: 0 | 1): Promise<IGetJournalOverviewResponse> {
    return firstValueFrom(this.http.get<IGetJournalOverviewResponse>(`${environment.api}journal/entries`, { params: { direction }}))
  }

  createEntry(income: IWJournalEntry): Promise<IPostResponse> {
    return firstValueFrom(this.http.post<IPostResponse>(`${environment.api}journal/entries`, income))
  }

  updateEntry(income: IJournalEntry): Promise<IPostResponse> {
    return firstValueFrom(this.http.put<IPostResponse>(`${environment.api}journal/entries/${income.id}`, income))
  }

  deleteEntry(id: number): Promise<IPostResponse> {
    return firstValueFrom(this.http.delete<IPostResponse>(`${environment.api}journal/entries/${id}`))
  }
}

export interface IGetJournalOverviewResponse {
  entries: IJournalEntry[]
}

export interface IWJournalEntry {
  name: string
  category: string
  amount: number
  date: Date
}

export interface IJournalEntry extends IWJournalEntry {
  id: number
}

export interface IPostResponse extends IPutResponse {
  id: number
}

export interface IPutResponse {
  success: boolean
}