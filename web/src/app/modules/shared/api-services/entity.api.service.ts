import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {UiService} from '../../../ui.service';
import {
    DataPointsModel,
    DropdownValuesModel,
    EntityDefinitionModel,
    MapperListModel,
    UserLogModel,
    ValidationMasterModel
} from "../modals/entity.model";
import {ResponseModel} from "../modals/response.model";
import {DropDownModel} from "../modals/common.model";
import {URLS} from "../../../ui.service";
import {AuthService} from "../../../core/auth/auth.service";

@Injectable({
    providedIn: 'root'
})
export class EntityApiService {

   
    httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json'
        })
    };
    entityList: any[] = [];
    validationMasterList: ValidationMasterModel[] = [];
    enrichmentMasterList: ValidationMasterModel[] = [];

    constructor(private http: HttpClient, private _ui: UiService, private auth: AuthService) {
        this.getValidations();
        this.getEnrichment();
    }

    loadEntityList() {
        return new Promise(resolve => this.getDataByProcess('ENTITY').subscribe(res => {
            this.entityList = res;
            resolve(true);
        }));

    }
    saveBusinessCalConfig(input:any) {
        return this.http.post(sessionStorage.getItem('apiUrl') + 'calendar/save-business-cal', input, this._ui.httpOptions);
    }

    getBusinessCalConfigList() {
        return this.http.get(sessionStorage.getItem('apiUrl') + 'calendar/business-cal-list', this._ui.httpOptions);
    }

    deleteBusinessCalConfig(id: any) {
        return this.http.delete(sessionStorage.getItem('apiUrl') + 'calendar/delete-business-cal?id=' + id, this._ui.httpOptions);
    }

    getCalendarEvents(configId: number | null, startDate: string, endDate: string) {
        let url = sessionStorage.getItem('apiUrl') + 'calendar/events?startDate=' + startDate + '&endDate=' + endDate;
        if (configId !== null) {
            url += '&configId=' + configId;
        }
        return this.http.get<any[]>(url, this._ui.httpOptions);
    }

    getValidations() {
        this.getValidatorList('VAL').subscribe((res: ValidationMasterModel[]) => this.validationMasterList = res);
    }

    getEnrichment() {
        this.getValidatorList('ENT').subscribe((res: ValidationMasterModel[]) => this.enrichmentMasterList = res);
    }

    getDataPointsList(params: any): Observable<any> {
        return this.http.get(sessionStorage.getItem('apiUrl') + 'master/dataPoints', this._ui.httpOptions);
    }

    deleteDataPointsById(id: number): Observable<ResponseModel> {
        return this.storeDataByProcessName('DELETE_DATAPOINT_BY_ID', [{id}]);
    }

    saveDataPointsData(input: DataPointsModel): Observable<ResponseModel> {
        return this.storeDataByProcessName('INSERT_DATAPOINT', [input]);
    }

    getEntityDefinitionList(): Observable<any> {
        return this.http.get(sessionStorage.getItem('apiUrl') + 'master/entity', this._ui.httpOptions);
    }

    deleteEntityDefinitionById(entityCode: string, deleteScreenPrivilege: boolean = false): Observable<ResponseModel> {
        return this.http.post<ResponseModel>(
            sessionStorage.getItem('apiUrl') + 'entity/entity-definition/delete/' + entityCode + '?deleteScreenPrivilege=' + deleteScreenPrivilege,
            {},
            this._ui.httpOptions
        );
    }

    saveAllEntityDefinitionDataPointsData(input: any) {
        return this.http.post(sessionStorage.getItem('apiUrl') + 'entity/entity-definition', input, this._ui.httpOptions);
    }

    getEntityDefinitionByCode(entityCode: string): Observable<any> {
        return this.http.get(sessionStorage.getItem('apiUrl') + 'entity/entity-definition/' + entityCode, this._ui.httpOptions);
    }

    getEntityDataPoints(entityCode: string): Observable<any> {
        return this.getDataByProcessName('ENTITY_DATAPOINT_FOR_CREATION', {entityCode});
    }

    getEntityDataPointGroups(entityCode: string): Observable<any> {
        return this.getDataByProcessName('ENTITY_DATAPOINT_GROUP_BY_ENTITY_CODE', {entityCode});
    }

    getEntityDataRecordByID(entityCode: string, data: any) {
        return this.http.post(sessionStorage.getItem('apiUrl') + 'entity/record/get/' + entityCode, data, this._ui.httpOptions);
    }

    deleteEntityRecord(entityCode: string, data: any): Observable<any> {
        return this.http.post(sessionStorage.getItem('apiUrl') + 'entity/record/delete/' + entityCode, data, this._ui.httpOptions);
    }

    saveEntityRecord(entityCode: string, input: any[]) {
        return this.http.post(sessionStorage.getItem('apiUrl') + 'entity/record/save/' + entityCode, input, this._ui.httpOptions);
    }

    getValidatorList(validationType: string): Observable<ValidationMasterModel[]> {
        return this.getDataByProcessName('VALIDATION_MASTER', {validationType});
    }

    getValidatorGridData(validationType: string): Observable<any> {
        return this.http.get(sessionStorage.getItem('apiUrl') + 'master/validators' + '?validationType=' + validationType, this._ui.httpOptions);
    }

    getSchedulerGridData(entityCode?: any): Observable<any> {
        const entCode = (entityCode && typeof entityCode === 'string') ? entityCode : '';
        return this.http.get(sessionStorage.getItem('apiUrl') + 'master/scheduler?entityCode=' + entCode, this._ui.httpOptions);
    }

    saveScheduler(input: any): Observable<any> {
        return this.http.post(sessionStorage.getItem('apiUrl') + 'master/scheduler/save', input, this._ui.httpOptions);
    }

    deleteScheduler(id: string): Observable<any> {
        return this.http.delete(sessionStorage.getItem('apiUrl') + 'master/scheduler/delete?id=' + id, this._ui.httpOptions);
    }

    getCodeGeneratorGridData(): Observable<any> {
        return this.http.get(sessionStorage.getItem('apiUrl') + 'master/code-generator', this._ui.httpOptions);
    }

    saveCodeGenerator(input: any): Observable<any> {
        return this.http.post(sessionStorage.getItem('apiUrl') + 'master/code-generator/save', input, this._ui.httpOptions);
    }

    deleteCodeGenerator(id: string): Observable<any> {
        return this.http.delete(sessionStorage.getItem('apiUrl') + 'master/code-generator/delete?id=' + id, this._ui.httpOptions);
    }

    reloadScheduler(): Observable<any> {
        return this.http.post(sessionStorage.getItem('apiUrl') + 'master/scheduler/reload', {}, this._ui.httpOptions);
    }
    killScheduler(id: any): Observable<any> {
        return this.http.post(sessionStorage.getItem('apiUrl') + 'master/scheduler/kill?id=' + id, {}, this._ui.httpOptions);
    }
    getSchedulerLogs(schedulerId: any): Observable<any> {
        return this.http.get(sessionStorage.getItem('apiUrl') + 'master/scheduler/logs?schedulerId=' + schedulerId, this._ui.httpOptions);
    }
    getActionGridData(entityCode?: any) {
        const entCode = (entityCode && typeof entityCode === 'string') ? entityCode : '';
        return this.http.get(sessionStorage.getItem('apiUrl') + 'master/action?entityCode=' + entCode, this._ui.httpOptions);
    }
    saveAction(input: any) {
        return this.http.post(sessionStorage.getItem('apiUrl') + 'master/action/save', input, this._ui.httpOptions);
    }
    deleteAction(id: any) {
        return this.http.delete(sessionStorage.getItem('apiUrl') + 'master/action/delete?id=' + id, this._ui.httpOptions);
    }
    saveValidator(input: ValidationMasterModel): Observable<any> {
        return this.http.post(sessionStorage.getItem('apiUrl') + 'master/validators/save', input, this._ui.httpOptions);
    }

    getTablesList(dbSchema: string): Observable<any[]> {
        return this.getDataByProcessName('TABLES_NAME', {dbSchema});
    }

    getColumnListByTableName(dbSchema: string, tableName: string): Observable<any[]> {
        return this.getDataByProcessName('COLUMN_NAME', {tableName, dbSchema});
    }


    logsGrid(entityCode: any) {
        return this.http.get(sessionStorage.getItem('apiUrl') + 'entity/file/' + entityCode, this._ui.httpOptions);
    }

    logsFileUpload(input: any, entityCode: string) {
        return this.http.post(sessionStorage.getItem('apiUrl') + 'entity/file/' + entityCode, input, this._ui.httpOptions);
    }

    downloadLogsDocument(id: string, fileName: any): Observable<any> {
        return this.http.get(sessionStorage.getItem('apiUrl') + 'entity/file/' + id + '/' + fileName, {
            responseType: 'blob', headers: new HttpHeaders({'Content-Type': 'application/json'})
        });
    }

    downloadEntityTemplate(entityCode: string): Observable<any> {
        return this.http.get(sessionStorage.getItem('apiUrl') + 'entity/file/template/' + entityCode, this._ui.httpOptions);
    }

    downloadEntityTemplateWithData(entityCode: string): Observable<any> {
        return this.http.get(sessionStorage.getItem('apiUrl') + 'entity/file/template-with-dump/' + entityCode, {
            responseType: 'blob', headers: new HttpHeaders({'Content-Type': 'application/json'})
        });
    }

    getEntityDefinition(entityCode: string, parentEntityCode: string, parentGroupId: string, parentData: any) {
        return this.http.post(sessionStorage.getItem('apiUrl') + 'entity/record/grid-def/' + entityCode, {
            parentEntityCode,
            parentData,
            parentGroupId
        }, this._ui.httpOptions);
    }

    getEntityGridData(entityCode: string, filterData: any, parentEntityCode: string, parentGroupId: string, parentData: any) {
        return this.http.post(sessionStorage.getItem('apiUrl') + 'entity/record/grid/' + entityCode + '?' + this._ui.getUrlParams(filterData), {
            parentEntityCode,
            parentData,
            parentGroupId
        }, this._ui.httpOptions);
    }

    getDropdownGroup() {
        return this.getDataByProcessName('ENTITY_DROPDOWN_GROUP_FOR_DROPDOWN', {});
    }

    getDropdownValuesForCreation(groupCode: number, parentId: number) {
        return this.getDataByProcessName('ENTITY_DROPDOWN_VALUES_FOR_CREATION',
            {groupCode, parentId});
    }

    getEntityColumnById(entityCode: number): Observable<any> {
        return this.getDataByProcessName('ENTITY_COLUMN_BY_ID', {entityCode});
    }

    getEntityRelationDropdownValues(input: any): Observable<any> {
        return this.http.post(sessionStorage.getItem('apiUrl') + 'entity/entity-relation-dropdown-value/' + input.relationEntityCode + '/' + input.entityDatapointId, input, this._ui.httpOptions);
    }

    generateUniqueCode(masterCode: string): Observable<any> {
        return this.http.get(sessionStorage.getItem('apiUrl') + 'entity/code-generator/' + masterCode)
    }

    getMapperList(): Observable<MapperListModel[]> {
        return this.http.get<MapperListModel[]>(sessionStorage.getItem('apiUrl') + 'etl/mapper-list',
            this.httpOptions);
    }

    deleteMapperById(processId: string): Observable<ResponseModel> {
        return this.http.get<ResponseModel>(sessionStorage.getItem('apiUrl') + 'etl/mapper/delete/' + processId,
            this.httpOptions);
    }

    getUserLogList(): Observable<UserLogModel[]> {
        return this.http.get<UserLogModel[]>(sessionStorage.getItem('apiUrl') + 'etl/upload-list', this.httpOptions);
    }

    checkUploadPrecessData(fileLogId: string): Observable<any> {
        return this.http.get<any>(sessionStorage.getItem('apiUrl') + 'etl/preprocess-status?fileLogId='
            + fileLogId, this.httpOptions);
    }

    getDropdownValuesList(groupCode: number): Observable<DropdownValuesModel[]> {
        return this.getDataByProcessName('ENTITY_DROPDOWN_VALUES_BY_GROUP_CODE',
            {groupCode});
    }

    getDropdownValuesAll(): Observable<DropDownModel[]> {
        return this.getDataByProcess('ENTITY_DROPDOWN_VALUES_ALL');
    }

    updateDeleteDropdownValuesById(input: DropdownValuesModel[]): Observable<ResponseModel> {
        return this.storeDataByProcessName('DELETE_ENTITY_DROPDOWN_VALUES_BY_ID',
            input);
    }

    saveDropdownValues(input: DropdownValuesModel): Observable<ResponseModel> {
        return this.storeDataByProcessName('INSERT_ENTITY_DROPDOWN_VALUES', [input]);
    }

    getEntityDropdownGroup() {
        return this.getDataByProcess('ENTITY_DROPDOWN_GROUP');
    }

    saveEntityDropdownGroup(input: any[]) {
        return this.storeDataByProcessName('INSERT_ENTITY_DROPDOWN_GROUP', input);
    }

    deleteEntityDropdownGroup(input: any[]) {
        return this.storeDataByProcessName('DELETE_ENTITY_DROPDOWN_GROUP_BY_ID', input);
    }

    getSystemConfig() {
        return this.http.get('data/system-config.json');
    }

    uploadFile(file: File, fileName: string, fileId: string): Observable<ResponseModel> {
        const formData: FormData = new FormData();
        formData.append('file', file, fileName);
        return this.http.post<ResponseModel>(sessionStorage.getItem('apiUrl') + 'file-repository/upload/' + fileId, formData);
    }

    downloadFileById(fileId: string): Observable<any> {
        return this.http.get(sessionStorage.getItem('apiUrl') + 'file-repository/download/' + fileId, {
            responseType: 'blob', headers: new HttpHeaders({'Content-Type': 'application/json'})
        })
    }

    downloadFile(fileObject: any): Observable<any> {
        return this.http.post(sessionStorage.getItem('apiUrl') + 'file-repository/download', fileObject, {
            responseType: 'blob', headers: new HttpHeaders({'Content-Type': 'application/json'})
        })
    }

    getPrintList(entityCode?: string) {
        return this.getDataByProcessName('PRINT_CONFIGURATION', {
            entityCode: entityCode || ''
        });
    }

    deletePrintConfig(code: string) {
        return this.getDataByQuery('DELETE_PRINT_CONFIGURATION', { code });
    }

    getPrintPreview(html: string, input: any): Observable<any> {
        return this.http.post(sessionStorage.getItem('apiUrl') + 'entity/print/print-preview', {
            data: html,
            input: input
        }, this._ui.httpOptions);
    }


    getUrlParams(data: any) {
        return Object.keys(data).map((key) => key + '=' + data[key]).join('&');
    }

    getUserByCode(userCode: string): Observable<any> {
        return this.http.get<any>(sessionStorage.getItem('apiUrl') + URLS.ACCESS_USER_BY_CODE + userCode,
            this._ui.httpOptions);
    }

    getUsersList(searchValue: string): Observable<any> {
        return this.http.get<any>(sessionStorage.getItem('apiUrl') + URLS.ACCESS_USERS_LIST + searchValue,
            this._ui.httpOptions);
    }

    deleteUserByCode(userCode: string): Observable<any> {
        return this.http.delete<any>(sessionStorage.getItem('apiUrl') + URLS.ACCESS_DELETE_USER + userCode,
            this._ui.httpOptions);
    }

    saveUser(input: any): Observable<any> {
        return this.http.post<any>(sessionStorage.getItem('apiUrl') + URLS.ACCESS_SAVE_USER, input,
            this._ui.httpOptions);
    }

    getUserGroupByCode(userCode: string): Observable<any> {
        return this.http.get<any>(sessionStorage.getItem('apiUrl') + URLS.ACCESS_USER_GROUP + userCode,
            this._ui.httpOptions);
    }

    getUserGroupsList(searchValue: string): Observable<any> {
        return this.http.get<any>(sessionStorage.getItem('apiUrl') + URLS.ACCESS_USER_GROUPS_LIST
            + searchValue, this._ui.httpOptions);
    }

    getUserGroupsPrivilegeList(groupCode: string): Observable<any> {
        return this.http.get<any>(sessionStorage.getItem('apiUrl') + URLS.ACCESS_USER_GROUP_PRIVILEGE
            + groupCode, this._ui.httpOptions);
    }

    getUserGroupsPrivilegeForUserCode(groupCode: string): Observable<any> {
        return this.http.get<any>(sessionStorage.getItem('apiUrl') + URLS.ACCESS_USER_GROUP_PRIVILEGE_FOR_USER
            + groupCode, this._ui.httpOptions);
    }

    deleteUserGroupByCode(userCode: string): Observable<any> {
        return this.http.delete<any>(sessionStorage.getItem('apiUrl') + URLS.ACCESS_DELETE_USER_GROUP + userCode,
            this._ui.httpOptions);
    }

    saveUserGroup(input: any): Observable<any> {
        return this.http.post<any>(sessionStorage.getItem('apiUrl') + URLS.ACCESS_SAVE_USER_GROUP, input,
            this._ui.httpOptions);
    }

    getEntityAccess(entityCode: string): Observable<any> {
        return this.http.get<any>(sessionStorage.getItem('apiUrl') + URLS.ACCESS_ENTITY + entityCode,
            this._ui.httpOptions);
    }


    getDropdownDataByCode(dropdownCode: string): Observable<DropDownModel[]> {
        return this.http.get<DropDownModel[]>(sessionStorage.getItem('apiUrl') + URLS.DROPDOWN + dropdownCode,
            this._ui.httpOptions);
    }

    getParameterByCode(parameterCode: string): Observable<DropDownModel[]> {
        return this.http.get<DropDownModel[]>(sessionStorage.getItem('apiUrl') + URLS.PARAMETER + parameterCode,
            this._ui.httpOptions);
    }

    getDropdownDataByCodeWithInput(dropdownCode: string, input: any): Observable<DropDownModel[]> {
        return this.http.post<DropDownModel[]>(sessionStorage.getItem('apiUrl') + URLS.DROPDOWN
            + dropdownCode, input, this._ui.httpOptions);
    }

    getDataByProcessName(processName: string, input: any): Observable<any[]> {
        return this.http.post<any[]>(sessionStorage.getItem('apiUrl') + URLS.DATA + processName, input,
            this._ui.httpOptions);
    }

    storeDataByProcessName(processName: string, input: any): Observable<any> {
        return this.http.post(sessionStorage.getItem('apiUrl') + URLS.SAVE + processName, input, this._ui.httpOptions);
    }
    saveScreen(input: any): Observable<any> {
        return this.http.post(sessionStorage.getItem('apiUrl') + 'master/screens/save', input, this._ui.httpOptions);
    }
    storeBulkData(input: any[]): Observable<any> {
        return this.http.post(sessionStorage.getItem('apiUrl') + URLS.SAVE_BULK, input, this._ui.httpOptions);
    }

    getDataByProcess(processName: string): Observable<any> {
        return this.http.post(sessionStorage.getItem('apiUrl') + URLS.DATA + processName, this._ui.httpOptions);
    }

    getScreenList(): Observable<any> {
        return this.http.get(sessionStorage.getItem('apiUrl') + 'master/screens', this._ui.httpOptions);
    }
   
    getDataByQuery(query: string, input: any): Observable<any> {
        return this.http.post(sessionStorage.getItem('apiUrl') + URLS.DATA_BY_QUERY, {
            query, input
        }, this._ui.httpOptions);
    }

    getSingleDataByQuery(query: string, input: any): Observable<any> {
        return this.http.post(sessionStorage.getItem('apiUrl') + URLS.DATA_BY_SINGLE_QUERY, {
            query, input
        }, this._ui.httpOptions);
    }

    /** START ETL SERVICE */
    getEtlColumns(tableName: string) {
        return this.http.get(sessionStorage.getItem('apiUrl') + 'etl/columns/' + tableName, this._ui.httpOptions)
    }

    getEtlTablesList() {
        return this.http.get(sessionStorage.getItem('apiUrl') + 'etl/tables', this._ui.httpOptions)
    }

    /** END ETL SERVICE */

    resetUserPassword(userCode: string, newPassword: string) {
        return this.http.post<ResponseModel>(sessionStorage.getItem('apiUrl') + 'entity/access/user/reset-password', {
            userCode,
            newPassword
        }, this._ui.httpOptions);
    }

    sendPasswordResetEmail(userCode: string, email: string) {
        return this.http.post<ResponseModel>(sessionStorage.getItem('apiUrl') + 'entity/access/user/send-password-reset-email', {
            userCode,
            email
        }, this._ui.httpOptions);
    }
}
