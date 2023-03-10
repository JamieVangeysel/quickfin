import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import { environment } from 'src/environments/environment'

@Injectable({
  providedIn: 'root'
})
export class JournalApiService {
  constructor(private http: HttpClient) { }

  getEntries(direction: boolean | null): Promise<IJournalEntry[]> {
    let params = {}
    if (direction != null) params = { direction }
    return firstValueFrom(this.http.get<IJournalEntry[]>(`${environment.api}journal/entries`, { params, headers: { 'Authorization': 'yes' } }))
  }

  createEntry(entry: IWJournalEntry): Promise<IPostResponse> {
    return firstValueFrom(this.http.post<IPostResponse>(`${environment.api}journal/entries`, entry, { headers: { 'Authorization': 'yes' } }))
  }

  updateEntry(entry: IJournalEntry): Promise<IPostResponse> {
    return firstValueFrom(this.http.put<IPostResponse>(`${environment.api}journal/entries/${entry.id}`, entry, { headers: { 'Authorization': 'yes' } }))
  }

  deleteEntry(id: number): Promise<IPostResponse> {
    return firstValueFrom(this.http.delete<IPostResponse>(`${environment.api}journal/entries/${id}`, { headers: { 'Authorization': 'yes' } }))
  }
}

export interface IWJournalEntry {
  name: string
  category: string
  amount: number
  date: Date
  note?: string
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