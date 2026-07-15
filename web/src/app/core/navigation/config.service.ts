import {HttpClient} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {Observable, ReplaySubject, tap} from 'rxjs';
import {AuthService} from "../auth/auth.service";
import {DataService} from "../../data.service";

@Injectable({providedIn: 'root'})
export class ConfigService {
    private _httpClient = inject(HttpClient);
    private _dataService = inject(DataService);
    private _config: ReplaySubject<any> =
        new ReplaySubject<any>(1);

    constructor(private _auth: AuthService) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for navigation
     */
    get config$(): Observable<any> {
        return this._config.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get all navigation data
     */
    get(): Observable<any> {
        let jsonPath = 'data/config.json';
        if (window.location.href.includes('localhost')) {
            jsonPath = 'data/config.local.json';
        }
        return this._httpClient.get(jsonPath).pipe(tap((e: any) => {
            Object.keys(e).forEach(key => sessionStorage.setItem(key, e[key]));
            this._dataService.apiUrl = e.apiUrl;
            this._dataService.authUrl = e.authUrl;
        }));
    }
}
