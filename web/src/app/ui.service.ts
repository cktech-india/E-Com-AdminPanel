import {DatePipe} from '@angular/common';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatDialog} from '@angular/material/dialog';
import {ToastrService} from 'ngx-toastr';
import {FuseConfirmationService} from '../@fuse/services/confirmation';
import {ResponseModel} from './models/CommonModels';
import { DataType } from './modules/shared/modals/entity.model';
import { map } from 'rxjs';

interface ConfirmationModel {
    message: string;
    title: string;
    type: string | 'info';
    yesText: string | 'Yes';
    noText: string | 'No';
    icon: AlterIconModel;
}

interface AlterModel {
    message: string;
    title: string;
    type: string | 'info';
}

interface AlterIconModel {
    show: boolean;
    color: 'info' | 'primary' | 'accent' | 'warn' | 'basic' | 'success' | 'warning' | 'error';
    name: string | 'info';
}

@Injectable({providedIn: 'root'})
export class UiService {

    patterns = {
        numeric: '^[0-9]+$',
        numericWithDot: '^[0-9.]+$',
        alphaNumeric: '^[a-zA-Z0-9]+$',
        alphaNumericWithSpace: '^[a-zA-Z0-9 ]+$',
        alphaNumericWithSpaceAndHyphen: '^[a-zA-Z0-9 -]+$',
        alphaNumericWithHyphen: '^[a-zA-Z0-9-]+$',
        alphaNumericWithUnderscoreAndHyphen: '^[a-zA-Z0-9_-]+$',
        alphaNumericWithSpecialCharacters: '^[a-zA-Z0-9-./ ]+$',
        alphabeticWithSpace: '^[a-zA-Z ]+$',
        alphabetic: '^[a-zA-Z]+$',
        alphabeticWithUnderScore: '^[a-zA-Z_]+$',
        numericWithSomeSpecialCharacters: '^[0-9+() ]+$',
        // eslint-disable-next-line
        forEmail: '^[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$',
        decimalWithNegative: '^-?[0-9]+([,.][0-9]+)?$',
        alphaNumericWithDotAndHyphen: '[A-Za-z0-9.-_]+',
        alphaNumericWithDotAndSpace: '^[a-zA-Z0-9 .]*$',
        alphaNumericWithDot: '^[a-zA-Z0-9.]*$'
    };

       getBase64FromFile(file: File) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    getDataTypeLabel(code: any) {
        let arr: any[] = Object.entries(DataType);
        arr = arr.filter((x: any) => x[1] === code);
        return arr[0][0];
    }

    yesNoFormat(value: boolean) {
        return value ? 'Yes' : 'No';
    }
    dialog: any;
    http: any;
    httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json'
        })
    };
    httpOptionsBlob = {
        responseType: 'blob', headers: new HttpHeaders({
            'Content-Type': 'application/json'
        })
    }
    constructor(
        private _fuseConfirmationService: FuseConfirmationService,
        private _snackBar: MatSnackBar,
        private _toaster: ToastrService,
        private _http: HttpClient,
        private datePipe: DatePipe,
        private _dialog: MatDialog
    ) {
        this.http = _http;
        this.dialog = _dialog;
    }

    showSnackBar(message: string, action: string = 'Close', duration: number = 3000) {
        return this._snackBar.open(message, action, {duration: duration});
    }

    showToastr(title: string, message: string, type: string = 'success', duration: number = 3000) {
        if (type == 'success') {
            this._toaster.success(message, title, {
                timeOut: duration,
                positionClass: 'toast-top-right',
                closeButton: true,
                progressBar: true,
            });
        } else if (type == 'error') {
            this._toaster.error(message, title, {
                timeOut: duration,
                positionClass: 'toast-top-right',
            });
        } else {
            this._toaster.info(message, title, {timeOut: duration});
        }
    }

    showAlertSimple(title: string = '', message: string = '') {
        this._fuseConfirmationService.open({
            title: title,
            message: message,
            actions: {confirm: {label: 'Okay'}},
        });
    }

    showAlert(data: AlterModel) {
        this._fuseConfirmationService.open({
            title: data.title,
            message: data.message,
            actions: {confirm: {label: 'Okay'}},
        });
    }

    deleteAlert() {
        this._fuseConfirmationService.open({
            title: 'Deleted',
            message: 'Record Deleted Successfully',
            actions: {confirm: {label: 'Okay'}},
        });
    }
    successAlert(message: string) {
        this._fuseConfirmationService.open({
            title: 'Success',
            message: message,
            actions: {confirm: {label: 'Okay'}},
        });
    }
    saveAlert() {
        this._fuseConfirmationService.open({
            title: 'Saved',
            message: 'Saved Successfully',
            actions: {confirm: {label: 'Okay'}},
        });
    }
    showConfirmationSimple(title: string, message: string = '', icon: string = 'info', iconColor: string = 'info') {
        return this.showConfirmation({
            // @ts-ignore
            icon: {show: true, color: iconColor, name: icon},
            yesText: 'Yes',
            noText: 'No',
            message: message,
            title: title,
            type: 'info',
        }).pipe(
            map(result => result === 'confirmed')
        );
    }

    showConfirmation(
        data: ConfirmationModel = {
            icon: {show: false, color: 'info', name: 'info'},
            yesText: 'Yes',
            noText: 'No',
            message: '',
            title: '',
            type: 'info',
        }
    ) {
        // @ts-ignore
        const confirmation = this._fuseConfirmationService.open({
            title: data.title,
            message: data.message,
            dismissible: true,
            icon: {
                show: data?.icon?.show || false,
                color: data?.icon?.color || 'info',
                name: data?.icon?.name || 'info',
            },
            actions: {confirm: {label: data.yesText || 'Okay'}, cancel: {label: data.noText || 'Cancel'}},
        });
        return confirmation.afterClosed();
    }

    clearFormErrors(form: FormGroup) {
        // First, clear any previous server-side errors
        Object.keys(form.controls).forEach((key) => {
            const control = form.get(key);
            if (control.hasError('serverError')) {
                const errors = {...control.errors};
                delete errors['serverError'];
                control.setErrors(Object.keys(errors).length ? errors : null);
            }
        });
    }

    setFormErrors(formGroup: FormGroup, response: ResponseModel) {
        Object.keys(response.otherMessages).forEach((key) => {
            const control = formGroup.get(key);
            if (control) {
                control.markAsDirty();
                // Set the server error directly on the form control
                control.markAsTouched()
                control.setErrors({serverError: response.otherMessages[key]});
            }
        });
    }

    getErrorMessage(form: FormGroup, controlName: string): string | null {
        if (!form || !controlName) {
            return null;
        }
        const control = form.get(controlName);
        if (!control || (control.pristine && !control.hasError('serverError'))) {
            return null; // Don't show errors on untouched fields unless there's a server error
        }
        // Prioritize client-side errors
        if (control.hasError('required')) {
            return 'This field is required.';
        }
        if (control.hasError('email')) {
            return 'Please enter a valid email address.';
        }
        console.log('test');
        // Check for the custom server error last
        if (control.hasError('serverError')) {
            return control.errors['serverError'];
        }
        return null;
    }

    getStatusClasses(status: string): string {
        const baseClasses = 'status-pill px-2 py-1 rounded-full text-xs font-medium';
        const statusMap: { [key: string]: string } = {
            A: 'bg-green-100 text-green-800', // Approved
            R: 'bg-red-100 text-red-800', // Rejected (Note: Table says R = Rejected)
            REQ: 'bg-blue-100 text-blue-800', // Requested
            S: 'bg-indigo-100 text-indigo-800', // Submitted
            D: 'bg-gray-100 text-gray-800', // Drafted
            P: 'bg-yellow-100 text-yellow-800', // Pending
            INP: 'bg-orange-100 text-orange-800', // In Progress
            C: 'bg-teal-100 text-teal-800', // Completed
            CNL: 'bg-slate-200 text-slate-600', // Cancelled
        };
        return `${baseClasses} ${statusMap[status] || 'bg-gray-100 text-gray-500'}`;
    }

    getDBDateFormat(date: Date) {
        return this.datePipe.transform(date, 'yyyy-MM-dd hh:mm:ss');
    }
    getDateFormat(date: any, format: string = 'dd-MMM-yyyy') {
        return this.datePipe.transform(date, format);
    }

    downloadFile(data: any, fileName: string) {
        const blob = new Blob([data], {type: 'application/octet-stream'});
        const url = window.URL.createObjectURL(blob);
        const linkToFile = document.createElement('a');
        linkToFile.download = fileName;
        linkToFile.href = url;
        linkToFile.click();
    }

    infoAlert(message: string) {
        this._toaster.info(message);
    }

    errorAlert(message: any) {
        this._toaster.error(message);
    }

    systemErrorAlert() {
        this._toaster.error('Unable to perform your request!!! Please contact Admin');
    }

    print(input: any) {
        return this._http
            .post(sessionStorage.getItem('apiUrl') + 'app-configurations/print', input)
            .subscribe((res: any) => {
                const winparams =
                    'dependent=yes,locationbar=no,scrollbars=yes,menubar=yes,' +
                    'resizable,screenX=50,screenY=50,width=850,height=1050';
                const htmlPop =
                    '<embed width=100% height=100%' +
                    ' type="application/pdf"' +
                    ' src="data:application/pdf;base64,' +
                    escape(res.data) +
                    '"></embed>';
                const printWindow = window.open('', 'PDF', winparams);
                printWindow.document.write(htmlPop);
                setTimeout(() => printWindow.print(), 2000);
            });
    }
    getUrlParams(data: any) {
        return Object.keys(data).map((key) => key + '=' + data[key]).join('&');
    }
    isValidForm(form: FormGroup) {
        let result = true;
        Object.keys(form.controls).forEach(key => {
            form.controls[key].markAsDirty();
            form.controls[key].markAsTouched();
            if (!form.controls[key].valid) {
                console.log(key);
                result = false;
            }
        });
        return result;
    }
    
    keyPress(event: KeyboardEvent, patten: any) {
        if (!new RegExp(patten).test(String.fromCharCode(event.keyCode))) {
            event.preventDefault();
        }
    }
}


export const URLS = {
    DATA: 'entity/data/',
    DATA_BY_QUERY: 'entity/data/by-query',
    DATA_BY_SINGLE_QUERY: 'entity/data/by-query-single',
    DROPDOWN: 'entity/data/dropdown/',
    PARAMETER: 'entity/data/parameter/',
    SAVE: 'entity/data/save/',
    SAVE_BULK: 'entity/data/save-bulk',
    AUTHENTICATE: 'authenticate/login',
    DATAPOINTS_BY_ID: 'entity/datapoints/',
    DATAPOINTS_DELETE: 'entity/datapoints/delete/',
    DATAPOINTS_GRID: 'entity/datapoints/grid',
    DATAPOINTS_SAVE: 'entity/datapoints/save',
    COUNT: 'entity/reports/count',
    DELETE: 'entity/reports/delete/',
    EXPORT: 'entity/reports/export',
    PROCESS_EXPORT: 'entity/reports/process-export',
    REPORT: 'entity/reports/report',
    REPORT_COUNT: 'entity/reports/report-count',
    REPORT_EXPORT: 'entity/reports/report-export',
    REPORTS: 'entity/reports',
    TEMPLATE_EXPORT: 'entity/reports/template-export',
    WIDGET: 'entity/reports/widget',
    WIDGET_COUNT: 'entity/reports/widget/count',
    WIDGET_DELETE: 'entity/reports/widget/delete/',
    USER_GROUP_COUNT: 'entity/user-group/count',
    USER_GROUP_DELETE: 'entity/user-group/delete/',
    USER_GROUP_PRIVILEGES: 'entity/user-group/privileges/',
    USER_GROUP_USER_GROUP: 'entity/user-group',


    ACCESS_USER_BY_CODE: 'entity/access/users',
    ACCESS_USERS_LIST: 'entity/access/users?searchValue=',
    ACCESS_DELETE_USER: 'entity/entity/access/users/',
    ACCESS_SAVE_USER: 'entity/access/users',
    ACCESS_USER_GROUP: 'entity/access/user-groups/',
    ACCESS_USER_GROUPS_LIST: 'entity/access/user-groups?searchValue=',
    ACCESS_USER_GROUP_PRIVILEGE: 'entity/access/user-group-privilege-edit/',
    ACCESS_USER_GROUP_PRIVILEGE_FOR_USER: 'entity/access/user-group-privilege/',
    ACCESS_DELETE_USER_GROUP: 'entity/access/user-groups/',
    ACCESS_SAVE_USER_GROUP: 'entity/access/user-groups',
    ACCESS_ENTITY: 'entity/access/entity-access/',

};
