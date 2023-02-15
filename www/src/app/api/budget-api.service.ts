import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import { environment } from 'src/environments/environment'

@Injectable({
  providedIn: 'root'
})
export class BudgetApiService {
  constructor(private http: HttpClient) { }

  getOverview(): Promise<IGetBudgetOverviewResponse> {
    return firstValueFrom(this.http.get<IGetBudgetOverviewResponse>(`${environment.api}budget/overview`, { headers: { 'Authorization': 'yes' } }))
  }

  createIncome(income: IWBudgetEntry): Promise<IPostResponse> {
    return firstValueFrom(this.http.post<IPostResponse>(`${environment.api}budget/incomes`, income, { headers: { 'Authorization': 'yes' } }))
  }

  updateIncome(income: IBudgetEntry): Promise<IPostResponse> {
    return firstValueFrom(this.http.put<IPostResponse>(`${environment.api}budget/incomes/${income.id}`, income, { headers: { 'Authorization': 'yes' } }))
  }

  deleteIncome(id: number): Promise<IPostResponse> {
    return firstValueFrom(this.http.delete<IPostResponse>(`${environment.api}budget/incomes/${id}`, { headers: { 'Authorization': 'yes' } }))
  }

  createExpense(expense: IWBudgetEntry): Promise<IPostResponse> {
    return firstValueFrom(this.http.post<IPostResponse>(`${environment.api}budget/expenses`, expense, { headers: { 'Authorization': 'yes' } }))
  }

  updateExpense(expense: IBudgetEntry): Promise<IPostResponse> {
    return firstValueFrom(this.http.put<IPostResponse>(`${environment.api}budget/expenses/${expense.id}`, expense, { headers: { 'Authorization': 'yes' } }))
  }

  deleteExpense(id: number): Promise<IPostResponse> {
    return firstValueFrom(this.http.delete<IPostResponse>(`${environment.api}budget/expenses/${id}`, { headers: { 'Authorization': 'yes' } }))
  }
}

export interface IGetBudgetOverviewResponse {
  years: IYear[],
  incomes: IBudgetEntry[],
  expenses: IBudgetEntry[]
}

export interface IYear {
  year: number
}

export interface IWBudgetEntry {
  name: string,
  value: number,
  year: number
}

export interface IBudgetEntry extends IWBudgetEntry {
  id: number
}

export interface IPostResponse extends IPutResponse {
  id: number
}

export interface IPutResponse {
  success: boolean
}