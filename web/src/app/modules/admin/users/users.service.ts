import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { DataService } from "../../../data.service";

@Injectable({ providedIn: 'root' })
export class UserService {

    constructor(private httpClient: HttpClient, private dataService: DataService) {}

    save(user: any): Observable<any> {
        return this.httpClient.post<any>(this.dataService.apiUrl + 'users', user);
    }

    get(id: number): Observable<any> {
        return this.httpClient.get<any>(this.dataService.apiUrl + 'users/' + id);
    }

    getList(): Observable<any[]> {
        return this.httpClient.get<any[]>(this.dataService.apiUrl + 'users/list');
    }

    getActiveList(): Observable<any[]> {
        return this.httpClient.get<any[]>(this.dataService.apiUrl + 'users/active-list');
    }

    resetPassword(id: number, newPassword: string): Observable<any> {
        return this.httpClient.post<any>(`${this.dataService.apiUrl}users/${id}/reset-password`, { newPassword });
    }

    changeRole(id: number, userType: string): Observable<any> {
        return this.httpClient.post<any>(`${this.dataService.apiUrl}users/${id}/change-role?userType=${userType}`, {});
    }

    delete(id: number): Observable<any> {
        return this.httpClient.delete<any>(this.dataService.apiUrl + 'users/' + id);
    }

    getAddressListByUserId(userId: number): Observable<any[]> {
        return this.httpClient.get<any[]>(`${this.dataService.apiUrl}users/addresses/user/${userId}`);
    }

    saveAddress(address: any): Observable<any> {
        return this.httpClient.post<any>(`${this.dataService.apiUrl}users/addresses`, address);
    }

    deleteAddress(id: number): Observable<any> {
        return this.httpClient.delete<any>(`${this.dataService.apiUrl}users/addresses/${id}`);
    }
}
