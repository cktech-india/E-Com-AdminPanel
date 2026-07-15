import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {ResponseModel} from "../../../models/CommonModels";
import {DataService} from "../../../data.service";

export interface UserModel {
    userId: string;
    firstName: string;
    lastName: string;
    password: string;
    email: string;
    phone: string;
    userRole: string;
    roleName:string;
    isActive: boolean;
    isDeleted: boolean;
    userType:string;
    reportingTo:string;
}


export interface EmployeeMasterModel {
    employeeId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    companyRole: string;
    designation : string;
    gender:string;
    dateOfBirth : Date;
    dateOfJoin: Date;
    isActive: boolean;
    isDeleted: boolean;
    companyRoleName:string;
    designationName:string;
}

export interface UserRoleModel {
    roleCode: string;
    roleName: string;
    isActive: boolean;
    isDeleted: boolean;
    userRolePrivileges: UserRolePrivilegeModel[];
}

export interface UserRolePrivilegeModel {
    roleCode: string;
    canCreate: boolean;
    canEdit: boolean;
    canView: boolean;
    canDelete: boolean;
    isActive: boolean;
    isDeleted: boolean;
}

@Injectable({providedIn: 'root'})
export class UserService {

    constructor(private httpClient: HttpClient, private dataService: DataService) {

    }

    save(inputForm: UserModel): Observable<ResponseModel> {
        return this.httpClient.post<ResponseModel>(this.dataService.apiUrl + 'user', inputForm);
    }

    get(id: string): Observable<UserModel> {
        return this.httpClient.get<UserModel>(this.dataService.apiUrl + 'user/id/' + id);
    }

    getList(params: any): Observable<any> {
        return this.httpClient.post<any>(this.dataService.apiUrl + 'user/list', params);
    }

    getActiveList(params: any = { pageSize: 10000, pageIndex: 0 }): Observable<UserModel[]> {
        return this.httpClient.post<UserModel[]>(this.dataService.apiUrl + 'user/list-active', params);
    }

    getListCount(params: any): Observable<UserModel[]> {
        return this.httpClient.post<UserModel[]>(this.dataService.apiUrl + 'user/count', params);
    }

    passwordReset(userId: string): Observable<ResponseModel> {
        return this.httpClient.get<ResponseModel>(this.dataService.apiUrl + 'user/password-reset?userId=' + userId);
    }

    delete(id: string): Observable<ResponseModel> {
        return this.httpClient.delete<ResponseModel>(this.dataService.apiUrl + 'user/' + id);
    }

    saveUserRole(inputForm: UserRoleModel): Observable<ResponseModel> {
        return this.httpClient.post<ResponseModel>(this.dataService.apiUrl + 'user-role', inputForm);
    }

    getUserRole(id: string): Observable<UserRoleModel> {
        return this.httpClient.get<UserRoleModel>(this.dataService.apiUrl + 'user-role/id/' + id);
    }

    getListUserRole(params: any): Observable<any> {
        return this.httpClient.post<any>(this.dataService.apiUrl + 'user-role/list', params);
    }

    getActiveListUserRole(params: any): Observable<UserRoleModel[]> {
        return this.httpClient.post<UserRoleModel[]>(this.dataService.apiUrl + 'user-role/list-active', params);
    }

    getListCountUserRole(params: any): Observable<UserRoleModel[]> {
        return this.httpClient.post<UserRoleModel[]>(this.dataService.apiUrl + 'user-role/count', params);
    }

    deleteUserRole(id: string): Observable<ResponseModel> {
        return this.httpClient.delete<ResponseModel>(this.dataService.apiUrl + 'user-role/' + id);
    }
    getEmployeeList(params: any): Observable<any> {
        return this.httpClient.post<any>(this.dataService.apiUrl + 'employee/list', params);
    }
    getEmployeeListCount(params: any): Observable<any> {
        return this.httpClient.post<any>(this.dataService.apiUrl + 'employee/count', params);
    }
    getActiveEmployeeList(params: any): Observable<UserModel[]> {
        return this.httpClient.post<UserModel[]>(this.dataService.apiUrl + 'employee/list-active', params);
    }
    saveEmployeeMaster(inputForm: EmployeeMasterModel): Observable<ResponseModel> {
        return this.httpClient.post<ResponseModel>(this.dataService.apiUrl + 'employee', inputForm);
    }
    deleteEmployeeMaster(component: EmployeeMasterModel): Observable<ResponseModel> {
            // Create query parameters for the composite ID
            const params = `employeeId=${encodeURIComponent(component.employeeId)}`;
            return this.httpClient.delete<ResponseModel>(`${this.dataService.apiUrl}employee/delete?${params}`);
        }
}
