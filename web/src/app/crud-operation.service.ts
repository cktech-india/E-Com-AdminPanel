import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DropdownModel } from "./modules/admin/dashboard/chart.service";

@Injectable({
  providedIn: 'root',
})
export class CrudService {
  constructor(private http: HttpClient) {
  }


  getDropdownValues(dropdownId: string): Observable<DropdownModel[]> {
    return this.http.get<DropdownModel[]>(`${sessionStorage.getItem('apiUrl')}data/dropdown/${dropdownId}`);
  }

  getDropdownValuesWithInput(dropdownId: string, input: any): Observable<DropdownModel[]> {
    const url = `${sessionStorage.getItem('apiUrl')}data/dropdown/${dropdownId}`;
    return this.http.post<DropdownModel[]>(url, input);
  }

  getParameterValuesWithInput(type: string, parentCode: string = ''): Observable<DropdownModel[]> {
    const url = `${sessionStorage.getItem('apiUrl')}data/parameter/${type}${parentCode ? ('/' + parentCode) : ''}`;
    return this.http.get<DropdownModel[]>(url);
  }

  getResult(input: any) {
    return this.http.post(sessionStorage.getItem('apiUrl') + 'data/result', input);
  }

  getResultMulti(input: any[]) {
    return this.http.post(sessionStorage.getItem('apiUrl') + 'data/result-multi', input);
  }

  putUpdateMulti(input: any[]) {
    return this.http.post(sessionStorage.getItem('apiUrl') + 'data/update-multi', input);
  }

  putUpdate(input: any) {
    return this.http.post(sessionStorage.getItem('apiUrl') + 'data/update', input);
  }

  getMasterResult(entityName: string) {
    return this.http.get(sessionStorage.getItem('apiUrl') + 'master/' + entityName);
  }

  getMasterResultById(entityName: string, id: any) {
    return this.http.get(sessionStorage.getItem('apiUrl') + 'master/' + entityName + '/' + id);
  }

  postMasterData(entityName: string, input: any[]) {
    return this.http.post(sessionStorage.getItem('apiUrl') + 'master/' + entityName, input);
  }

  deleteMasterData(entityName: string, id: string) {
    return this.http.delete(sessionStorage.getItem('apiUrl') + 'master/' + entityName + '/' + id);
  }
}
