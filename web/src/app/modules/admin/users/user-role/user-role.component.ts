import { Component, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs';
import { UiService } from '../../../../ui.service';
import { SHARED_DIRECTIVES } from '../../../../core/util/shared-utils';
import { CkTable, FuseAlertComponent } from '@fuse/components/table-grid/table-grid.component';
import { FuseDrawerComponent } from '@fuse/components/drawer';
import { MatSelectModule } from '@angular/material/select';
import { EntityApiService } from '../../../shared/api-services/entity.api.service';
import { RecordMode } from '../../../../models/CommonModels';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'user-role',
    templateUrl: './user-role.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [MatSlideToggle, MatInput,FormsModule, MatError, MatFormField, MatLabel, MatIconModule, MatButtonModule,MatSelectModule,
         MatCard, MatCardContent, ReactiveFormsModule, SHARED_DIRECTIVES, FuseAlertComponent, FuseDrawerComponent]  
})
export class UserRoleComponent implements OnInit {

    // ================= VIEWCHILD =================
    @ViewChild('entityFormTpl') entityFormTplRef!: FuseDrawerComponent;
    @ViewChild('boolInput', {static: true}) toggleTpl!: TemplateRef<any>;

    // ================= FORM =================
    inputForm!: FormGroup;

    // ================= STATE =================
    recordMode: RecordMode = RecordMode.Create;
    table!: CkTable;
    rolePrivilegeTable!: CkTable;

    rolePrivilegeData: any[] = [];
    filteredRolePrivilegeData: any[] = [];
    screen: any = {
        canCreate: false,
        canView: false,
        canEdit: false,
        canDelete: false,
        module: ''
    };
    modulesDropDownItems: {id: string, name: string}[] = [];

    searchControl = new FormControl('');

    filterValue: any = {
        pageIndex: 0,
        pageSize: 10,
        searchValue: ''
    };

    constructor(
        private _service: EntityApiService,
        protected uiService: UiService
    ) {
        this.searchControl.valueChanges
            .pipe(
                startWith(''),
                debounceTime(400),
                distinctUntilChanged(),
                map(value => value || '')
            )
            .subscribe((value: string) => {
                this.filterValue.searchValue = value;
                this.getGridData();
            });
    }

    // ================= INIT =================
    ngOnInit(): void {
        this.initializeControls();
        this.getGridData();
    }

    // ================= INITIALIZE =================
    initializeControls() {

        this.inputForm = new FormGroup({
            groupCode: new FormControl(null, Validators.required),
            groupName: new FormControl(null, Validators.required),
            isActive: new FormControl(true),
        });

        // ===== MAIN TABLE =====
        this.table = {
            gridData: [],
            columns: [
                { header: 'Group Code', column: 'groupCode' },
                { header: 'Group Name', column: 'groupName' },
                {
                    header: 'Active ?',
                    column: 'isActive',
                    formatter: (val: any) => val ? 'Yes' : 'No'
                }
            ],
            actions: [
                { label: 'Edit', icon: 'edit', color: 'primary', action: (row) => this.editRow(row) },
                {
                    label: 'Delete',
                    icon: 'delete',
                    color: 'warn',
                    confirm: true,
                    confirmTitle: 'Delete Confirmation',
                    confirmMessage: 'Are you sure you want to delete this record?',
                    action: (row) => this.deleteRow(row)
                }
            ],
            pageSize: 10,
            pageSizeOptions: [5, 10, 20],
            onPageChanged: (event: any) => {
                this.filterValue.pageIndex = event.pageIndex;
                this.filterValue.pageSize = event.pageSize;
                this.getGridData();
            }
        };

        // ===== PRIVILEGE TABLE =====
        this.rolePrivilegeTable = {
            gridData: [],
            columns: [
                { header: 'Module Name', column: 'moduleName' },
                { header: 'Screen Name', column: 'screenName' },
                { header: 'View', column: 'canView', template: this.toggleTpl },
                { header: 'Create', column: 'canCreate', template: this.toggleTpl },
                { header: 'Edit', column: 'canEdit', template: this.toggleTpl },
                { header: 'Delete', column: 'canDelete', template: this.toggleTpl }
            ],
            actions: []
        };
    }

    // ================= GRID =================
    getGridData() {
        this._service.getUserGroupsList(this.filterValue.searchValue).subscribe((data: any) => {
            this.table.gridData = Array.isArray(data) ? data : [];
            this.table = { ...this.table };
        });
    }

    // ================= NEW =================
    newRowClicked() {
        this.recordMode = RecordMode.Create;
        this.inputForm.reset();

        this.getUserGroupPrivilege('0');

        this.entityFormTplRef.toggle();
    }

    // ================= EDIT =================
    editRow(row: any) {
        this.recordMode = RecordMode.Edit;

        this.inputForm.patchValue(row);

        this.getUserGroupPrivilege(row.groupCode);

        this.entityFormTplRef.toggle();
    }

    // ================= DELETE =================
    deleteRow(row: any) {
        this._service.deleteUserGroupByCode(row.groupCode).subscribe(() => {
            this.getGridData();
            this.uiService.showToastr('Success', 'Deleted Successfully', 'success');
        });
    }

    // ================= PRIVILEGE =================
    getUserGroupPrivilege(groupCode: string) {
        this._service.getUserGroupsPrivilegeList(groupCode).subscribe((res: any[]) => {
            console.log('API RESPONSE FOR PRIVILEGES:', res);
            this.rolePrivilegeData = res;
            this.populateModulesDropdown();
            this.filteredRolePrivilegeData = [...this.rolePrivilegeData];
            this.rolePrivilegeTable.gridData = this.filteredRolePrivilegeData;
            this.rolePrivilegeTable = { ...this.rolePrivilegeTable };

        });
    }

    populateModulesDropdown() {
        this.modulesDropDownItems = [];
        this.rolePrivilegeData.forEach(e => {
            if (!this.modulesDropDownItems.find(x => x.id === e.moduleName)) {
                this.modulesDropDownItems.push({id: e.moduleName, name: e.moduleName});
            }
        });
    }

    onScreenAccessCheckAllClicked(accessCode: string) {
        this.rolePrivilegeData.filter(e => !this.screen.module || e.moduleName === this.screen.module)
            .forEach(e => e[accessCode] = this.screen[accessCode]);
        this.onModuleSelectionChanged();
    }

    onModuleSelectionChanged() {
        this.filteredRolePrivilegeData = [...this.rolePrivilegeData
            .filter(e => !this.screen.module || e.moduleName === this.screen.module)];
        this.rolePrivilegeTable.gridData = this.filteredRolePrivilegeData;
        this.rolePrivilegeTable = { ...this.rolePrivilegeTable };
    }

    // ================= SAVE =================
    onSubmitClicked() {

        if (!this.inputForm.valid) {
            this.uiService.showToastr('Error', 'Fill required fields', 'error');
            return;
        }

        const input = this.inputForm.getRawValue();

        this.rolePrivilegeData.forEach((e: any) => e.groupCode = input.groupCode);

        input.userGroupPrivilege = this.rolePrivilegeData;
        input.recordMode = this.recordMode;

        this._service.saveUserGroup(input).subscribe(() => {
            this.entityFormTplRef.toggle();
            this.getGridData();
            this.uiService.showToastr('Success', 'Saved Successfully', 'success');
        });
    }

    // ================= CANCEL =================
    onCancelClicked() {
        this.entityFormTplRef.toggle();
    }
}