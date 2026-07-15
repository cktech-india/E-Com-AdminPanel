import { Component, OnInit, ViewChild, ViewEncapsulation, TemplateRef } from '@angular/core';
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs';

// Angular Material Modules
import { MatButtonModule } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardModule } from '@angular/material/card';
import { MatOption, MatOptionModule } from '@angular/material/core';
import { MatError, MatFormField, MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInput, MatInputModule } from '@angular/material/input';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatSlideToggle, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

// Fuse Components
import { FuseDrawerComponent, FuseDrawerService } from '@fuse/components/drawer';

// ck-table type
import { CkTable, FuseAlertComponent } from '@fuse/components/table-grid/table-grid.component';

// Services
import { EntityApiService } from '../../../shared/api-services/entity.api.service';
import { UiService } from '@services/ui.service';

@Component({
    selector: 'app-user',
    templateUrl: './user.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
    MatButtonModule, FormsModule, ReactiveFormsModule,
    MatCardContent,
    MatCard,
    MatOption,
    MatError,
    MatFormField,
    MatInput,
    MatSelect,
    MatSlideToggle,
    MatIconModule,
    MatLabel,
    MatSlideToggle,
    FuseAlertComponent,
    FuseDrawerComponent,
    MatDialogModule
]
})
export class UserComponent implements OnInit {

    // ================= VIEW =================
    @ViewChild('entityFormTpl') drawer!: FuseDrawerComponent;
    @ViewChild('resetPasswordTpl') resetPasswordTpl!: TemplateRef<any>;

    // ================= FORM =================
    inputForm!: FormGroup;
    manualPasswordControl = new FormControl('', Validators.required);

    // ================= DATA =================
    table!: CkTable;
    recordMode: string = 'C';
    private _dialogRef: any;

    searchControl = new FormControl('');

    filterValue: any = {
        pageIndex: 0,
        pageSize: 10,
        searchValue: ''
    };

    userGroupDropdownItem: any[] = [];
    isLoading: boolean;

    constructor(
        private _service: EntityApiService,
        protected uiService: UiService,
        private _dialog: MatDialog
    ) {
        this.searchControl.valueChanges
            .pipe(
                startWith(''),
                debounceTime(400),
                distinctUntilChanged(),
                map(v => v || '')
            )
            .subscribe(value => {
                this.filterValue.searchValue = value;
                this.getGridData();
            });
    }

    // ================= INIT =================
    ngOnInit(): void {
        this.initializeControls();
        this.loadDropdowns();
        this.getGridData();
    }

    // ================= INIT FORM =================
    initializeControls() {
        this.inputForm = new FormGroup({
            userCode: new FormControl(null, Validators.required),
            firstName: new FormControl(null, Validators.required),
            lastName: new FormControl(null, Validators.required),
            email: new FormControl(null, Validators.required),
            mobile: new FormControl(null, Validators.required),
            groupCode: new FormControl(null, Validators.required),
            isNewUser: new FormControl(false),
            isActive: new FormControl(true),
        });

        // ===== TABLE =====
        this.table = {
            gridData: [],
            columns: [
                { header: 'User Code', column: 'userCode' },
                {
                    header: 'Name',
                    column: 'name',
                    formatter: (v, row) => `${row.firstName} ${row.lastName}`
                },
                { header: 'Email', column: 'email' },
                { header: 'Mobile', column: 'mobile' },
                {
                    header: 'Active',
                    column: 'isActive',
                    formatter: (v) => v ? 'Yes' : 'No'
                }
            ],
            actions: [
                {
                    label: 'Edit',
                    icon: 'edit',
                    action: (row) => this.editRow(row)
                },
                {
                    label: 'Reset Password',
                    icon: 'vpn_key',
                    action: (row) => this.resetPassword(row)
                },
                {
                    label: 'Delete',
                    icon: 'delete',
                    confirm: true,
                    confirmTitle: 'Delete Confirmation',
                    confirmMessage: 'Are you sure?',
                    action: (row) => this.deleteRow(row)
                }
            ],
            isShowFilter: true,
            pageSize: 10,
            pageSizeOptions: [5, 10, 20],
            onPageChanged: (e: any) => {
                this.filterValue.pageIndex = e.pageIndex;
                this.filterValue.pageSize = e.pageSize;
                this.getGridData();
            }
        };
    }

    // ================= DROPDOWN =================
    loadDropdowns() {
       this._service.getUserGroupsList("").subscribe({
            next: (res: any[]) => {
                res.forEach(e => this.userGroupDropdownItem.push({id: e.groupCode, name: e.groupName}));
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
                this.uiService.systemErrorAlert();
            }
        });
    }

    // ================= GRID =================
    getGridData() {
        this.table.loading = true;
        this.table = { ...this.table };
        this._service.getUsersList(this.filterValue.searchValue).subscribe({
            next: (res: any[]) => {
                this.table.gridData = res || [];
                this.table.loading = false;
                this.table = { ...this.table };
            },
            error: () => {
                this.table.loading = false;
                this.table = { ...this.table };
            }
        });
    }

    // ================= ADD =================
    newRowClicked() {
        this.recordMode = 'C';
        this.inputForm.get('isNewUser')?.setValue(true);
        this.inputForm.reset();
        this.drawer.open();
    }

    // ================= EDIT =================
    editRow(row: any) {
        this.recordMode = 'E';
        this.inputForm.get('isNewUser')?.setValue(false);
        this.inputForm.patchValue(row);
        this.drawer.open();
    }

    // ================= DELETE =================
    deleteRow(row: any) {
        this._service.deleteUserByCode(row.userCode).subscribe(() => {
            this.getGridData();
            this.uiService.showToastr('Success', 'Deleted successfully', 'success');
        });
    }

    // ================= SAVE =================
    onSubmitClicked() {

        if (!this.inputForm.valid) {
            this.uiService.showToastr('Error', 'Fill required fields', 'error');
            return;
        }

        const input = this.inputForm.getRawValue();

        input.recordMode = this.recordMode;

        this._service.saveUser(input).subscribe({
            next: (res: any) => {
                if (res.status === 'SAVED') {
                    this.drawer.close();
                    this.getGridData();
                    this.uiService.showToastr('Success', 'Saved successfully', 'success');
                } else {
                    this.uiService.showToastr('Error', res.message, 'error');
                }
            },
            error: () => {
                this.uiService.showToastr('Error', 'System error', 'error');
            }
        });
    }

    // ================= PASSWORD RESET =================
    resetPassword(row: any) {
        this.searchControl.setValue(row.userCode);
        this.manualPasswordControl.reset();
        this._dialogRef = this._dialog.open(this.resetPasswordTpl, {
            data: row,
            width: '450px'
        });
    }

    closeResetDialog() {
        if (this._dialogRef) {
            this._dialogRef.close();
        }
    }

    onManualResetSubmit(user: any) {
        if (this.manualPasswordControl.invalid) {
            this.manualPasswordControl.markAsTouched();
            return;
        }

        const newPassword = this.manualPasswordControl.value || '';
        this._service.resetUserPassword(user.userCode, newPassword).subscribe({
            next: (res: any) => {
                if (res.status === 'SAVED') {
                    this.uiService.showToastr('Success', 'Password reset successfully', 'success');
                    this.closeResetDialog();
                } else {
                    this.uiService.showToastr('Error', res.message || 'Failed to reset password', 'error');
                }
            },
            error: () => {
                this.uiService.showToastr('Error', 'System error occurred', 'error');
            }
        });
    }

    onAutoGenerateEmailSubmit(user: any) {
        this._service.sendPasswordResetEmail(user.userCode, user.email).subscribe({
            next: (res: any) => {
                if (res.status === 'SAVED') {
                    this.uiService.showToastr('Success', 'Temporary password generated and email sent successfully', 'success');
                    this.closeResetDialog();
                } else {
                    this.uiService.showToastr('Error', res.message || 'Failed to send reset email', 'error');
                }
            },
            error: () => {
                this.uiService.showToastr('Error', 'System error occurred', 'error');
            }
        });
    }

    // ================= CANCEL =================
    onCancelClicked() {
        this.drawer.close();
    }
}