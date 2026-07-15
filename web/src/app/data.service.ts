import { DatePipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { UiService } from './ui.service';

export interface ApprovalModel {
    referenceId: string;
    statusCode: string;
    statusRemarks?: string;
}

export interface AppConfigurationModel {
    configKey: string;
    configValue: string;
    configCategory: string;
    description: string;
    dataType: string;
    isEditable: boolean;
    isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class DataService {
    dashboardInfo: any = {};
    globalFilter = [];
    globalFilterValues: any = {};
    apiUrl = '';
    authUrl = '';
    approvalStatusLabel: any = {
        D: 'Drafted',
        P: 'Submitted',
        P_P: 'Submitted',
        P_BA: 'Proposal Business Approved',
        P_FA: 'Proposal Finance Approved',
        P_LA: 'Proposal Legal Approved',

        D_P: 'Submitted For Draft Approval',
        D_BA: 'Draft Business Approved',
        D_FA: 'Draft Finance Approved',
        D_LA: 'Draft Legal Approved',

        F_P: 'Submitted For Final Signed Approval',
        F_BA: 'Final Business Approved',
        F_FA: 'Final Finance Approved',
        A: 'Legal Approved',
        R: 'Rejected',
        C: 'Cancelled',
        E: 'Expired',
    };

    contractApprovalActions: any = {
        BA: {
            filterCodes: ['P_P', 'D_P', 'F_P'],
            approveCode: { P_P: 'P_BA', D_P: 'D_BA', F_P: 'F_BA' },
            rejectCode: { P_P: 'R', D_P: 'R', F_P: 'R' },
            pageTitle: 'Business Approval',
            approvalActionMessage: ' Your Request has been approved by Business Team',
            rejectActionMessage: ' Your Request has been rejected by Business Team',
        },
        FA: {
            filterCodes: ['P_BA', 'D_BA', 'F_BA'],
            approveCode: { P_BA: 'P_FA', D_BA: 'D_FA', F_BA: 'F_FA' },
            rejectCode: { P_BA: 'R', D_BA: 'R', F_BA: 'R' },
            pageTitle: 'Finance Approval',
            approvalActionMessage: ' Your Request has been approved by Finance Team',
            rejectActionMessage: ' Your Request has been rejected by Finance Team',
        },
        LA: {
            filterCodes: ['P_FA', 'D_FA', 'F_FA'],
            approveCode: { P_FA: 'P_LA', D_FA: 'D_LA', F_FA: 'A' },
            rejectCode: { P_FA: 'R', D_FA: 'R', F_FA: 'R' },
            pageTitle: 'Legal Approval',
            approvalActionMessage: ' Your Request has been approved by Legal Team',
            rejectActionMessage: ' Your Request has been rejected by Legal Team',
        },
    };
appConfig: any = {};
    constructor(
        private httpClient: HttpClient,
        private datePipe: DatePipe,
        private uiService: UiService
    ) {
        if (sessionStorage.getItem('apiUrl')) {
            this.apiUrl = sessionStorage.getItem('apiUrl');
            this.authUrl = sessionStorage.getItem('authUrl');
        }
    }

    setBaseConfiguration(): Observable<any> {
        let jsonPath = 'data/config.json';
        if (window.location.href.includes('localhost')) {
            jsonPath = 'data/config.local.json';
        }
        return this.httpClient.get(jsonPath).pipe(
            tap((e: any) => {
                Object.keys(e).forEach((key) => sessionStorage.setItem(key, e[key]));
                this.apiUrl = e.apiUrl;
                this.authUrl = e.authUrl;
            })
        );
    }

    loadAppConfig(): Observable<any> {
        const token = sessionStorage.getItem('accessToken');
        if (token && token.includes('ZHVtbXlfc2lnbmF0dXJl')) {
            const dummyConfig = {};
            sessionStorage.setItem('appConfig', btoa(JSON.stringify(dummyConfig)));
            this.appConfig = dummyConfig;
            return of(dummyConfig);
        }

        return this.httpClient.get(this.apiUrl + 'entity/app-config', this.uiService.httpOptions).pipe(
            tap((data: any) => {
                sessionStorage.setItem('appConfig', btoa(JSON.stringify(data)));
                this.appConfig = data;
            }),
            catchError((error) => {
                console.error('App configuration failed to load:', error);
                const fallbackConfig = {};
                sessionStorage.setItem('appConfig', btoa(JSON.stringify(fallbackConfig)));
                this.appConfig = fallbackConfig;
                return of(fallbackConfig);
            })
        );
    }

    dateFormater(date: any, format: string = 'dd-MMM-yyyy') {
        return this.datePipe.transform(date, format);
    }

    dateTimeFormater(date: any, format: string = 'dd-MMM-yyyy  hh:mm:ss a') {
        return this.datePipe.transform(date, format);
    }

    getDBDateFormat(date: Date) {
        return this.datePipe.transform(date, 'yyyy-MM-dd hh:mm:ss');
    }

    getDBDateOnlyFormat(date: Date) {
        return this.datePipe.transform(date, 'yyyy-MM-dd');
    }

    getApprovalConfiguration(moduleCode: string, approvalCode: string) { }

    getApprovalStatus(status: string) {
        return this.approvalStatusLabel[status];
    }

    uploadDocument(file: File) {
        const formData = new FormData();
        formData.append('file', file);
        return this.httpClient.post<any>(this.apiUrl + 'documents/upload', formData);
    }
    SaveDocument(file: File) {
        const formData = new FormData();
        formData.append('file', file);
        return this.httpClient.post<any>(this.apiUrl + 'documents', formData);
    }

    getDocument(docId: string) {
        const httpOptions = {
            responseType: 'blob' as 'json', // Required for binary data
            headers: new HttpHeaders({
                Authorization: 'Bearer ' + sessionStorage.accessToken, // Optional headers
            }),
        };
        return this.httpClient.get<any>(this.apiUrl + 'documents/download?docId=' + docId, httpOptions);
    }

    downloadDocument(item: any) {
        this.getDocument(item.documentId).subscribe((e: any) => {
            const blob = new Blob([e], { type: 'application/octet-stream' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = item.documentName;
            a.click();
            window.URL.revokeObjectURL(url);
        });
    }

    getDocumentsByRefId(refId: string) {
        return this.httpClient.get<any>(this.apiUrl + 'documents/document-by-ref-id?refId=' + refId);
    }

    getAppConfiguration(configKey: string) {
        return this.httpClient.get<AppConfigurationModel>(this.apiUrl + 'app-configurations/' + configKey);
    }
}
