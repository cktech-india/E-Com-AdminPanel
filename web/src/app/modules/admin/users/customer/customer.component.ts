import { Component, OnInit, ViewChild, ViewEncapsulation, TemplateRef } from '@angular/core';
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs';
import { CommonModule } from '@angular/common';

// Angular Material Modules
import { MatButtonModule } from '@angular/material/button';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatOption } from '@angular/material/core';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

// Fuse Components
import { FuseDrawerComponent } from '@fuse/components/drawer';
import { CkTable, FuseAlertComponent } from '@fuse/components/table-grid/table-grid.component';

// Services
import { UserService } from '../users.service';
import { UiService } from '@services/ui.service';

@Component({
    selector: 'app-customer',
    templateUrl: './customer.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        CommonModule, MatButtonModule, FormsModule, ReactiveFormsModule,
        MatCardContent, MatCard, MatOption, MatError, MatFormField,
        MatInput, MatSelect, MatSlideToggle, MatIconModule, MatLabel,
        FuseAlertComponent, FuseDrawerComponent, MatDialogModule
    ]
})
export class CustomerComponent implements OnInit {

    // ================= VIEW =================
    @ViewChild('entityFormTpl') drawer!: FuseDrawerComponent;
    @ViewChild('resetPasswordTpl') resetPasswordTpl!: TemplateRef<any>;
    @ViewChild('addressFormTpl') addressFormTpl!: TemplateRef<any>;

    // ================= FORM =================
    inputForm!: FormGroup;
    addressForm!: FormGroup;
    manualPasswordControl = new FormControl('', [Validators.required, Validators.minLength(4)]);

    // ================= DATA =================
    table!: CkTable;
    recordMode: string = 'C';
    private _dialogRef: any;

    searchControl = new FormControl('');
    rawCustomersList: any[] = [];
    selectedCustomerAddresses: any[] = [];


    constructor(
        private _userService: UserService,
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
                this.filterGridData(value);
            });
    }

    ngOnInit(): void {
        this.initializeControls();
        this.getGridData();
    }

    initializeControls() {
        this.inputForm = new FormGroup({
            id: new FormControl(null),
            companyCode: new FormControl(sessionStorage.getItem('companyCode') || 'COMP1'),
            firstName: new FormControl('', Validators.required),
            lastName: new FormControl(''),
            email: new FormControl('', [Validators.required, Validators.email]),
            phoneNumber: new FormControl(''),
            passwordHash: new FormControl(''), // Plain text input here will be hashed by backend on save
            userType: new FormControl('USR', Validators.required), // USR for customers
            stateCode: new FormControl(''),
            isActive: new FormControl(true),
        });

        this.addressForm = new FormGroup({
            id: new FormControl(null),
            addressName: new FormControl('', Validators.required),
            fullName: new FormControl('', Validators.required),
            phoneNumber: new FormControl('', Validators.required),
            addressLine1: new FormControl('', Validators.required),
            addressLine2: new FormControl(''),
            city: new FormControl('', Validators.required),
            state: new FormControl('', Validators.required),
            postalCode: new FormControl('', Validators.required),
            country: new FormControl('India', Validators.required),
            isDefault: new FormControl(false)
        });


        // ===== TABLE =====
        this.table = {
            gridData: [],
            columns: [
                {
                    header: 'Customer Name',
                    column: 'name',
                    formatter: (v, row) => `${row.firstName} ${row.lastName || ''}`
                },
                { header: 'Email', column: 'email' },
                { header: 'Phone', column: 'phoneNumber' },
                {
                    header: 'Saved Addresses',
                    column: 'addresses',
                    formatter: (v, row) => `${(row.addresses || []).length} Address(es)`
                },
                {
                    header: 'Active',
                    column: 'isActive',
                    formatter: (v) => v ? 'Yes' : 'No'
                }
            ],
            actions: [
                {
                    label: 'View / Edit Info',
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
                    confirmMessage: 'Are you sure you want to delete this customer?',
                    action: (row) => this.deleteRow(row)
                }
            ],
            isShowFilter: true,
            pageSize: 10,
            pageSizeOptions: [5, 10, 20]
        };
    }

    getGridData() {
        this.table.loading = true;
        this.table = { ...this.table };
        
        this._userService.getList().subscribe({
            next: (res: any[]) => {
                // Filter only USR (Customer) users
                this.rawCustomersList = (res || []).filter(u => u.userType === 'USR');
                this.filterGridData(this.searchControl.value || '');
            },
            error: () => {
                this.table.loading = false;
                this.table = { ...this.table };
            }
        });
    }

    filterGridData(search: string) {
        const cleanSearch = search.toLowerCase().trim();
        if (!cleanSearch) {
            this.table.gridData = this.rawCustomersList;
        } else {
            this.table.gridData = this.rawCustomersList.filter(u => 
                (u.firstName + ' ' + (u.lastName || '')).toLowerCase().includes(cleanSearch) ||
                u.email.toLowerCase().includes(cleanSearch) ||
                (u.phoneNumber || '').includes(cleanSearch)
            );
        }
        this.table.loading = false;
        this.table = { ...this.table };
    }

    newRowClicked() {
        this.recordMode = 'C';
        this.selectedCustomerAddresses = [];
        this.inputForm.reset({
            companyCode: sessionStorage.getItem('companyCode') || 'COMP1',
            userType: 'USR',
            isActive: true
        });
        
        // Make password mandatory for new customers
        this.inputForm.get('passwordHash')?.setValidators(Validators.required);
        this.inputForm.get('passwordHash')?.updateValueAndValidity();
        this.drawer.open();
    }

    editRow(row: any) {
        this.recordMode = 'E';
        this.selectedCustomerAddresses = row.addresses || [];
        this.inputForm.reset();
        this.inputForm.patchValue(row);

        // Password not mandatory on edit
        this.inputForm.get('passwordHash')?.clearValidators();
        this.inputForm.get('passwordHash')?.updateValueAndValidity();
        this.drawer.open();
    }

    deleteRow(row: any) {
        this._userService.delete(row.id).subscribe({
            next: () => {
                this.getGridData();
                this.uiService.showToastr('Success', 'Customer deleted successfully', 'success');
            }
        });
    }

    onSubmitClicked() {
        if (!this.inputForm.valid) {
            this.uiService.showToastr('Error', 'Please fill all required fields', 'error');
            return;
        }

        const input = this.inputForm.getRawValue();
        // Preserve addresses on update
        if (this.recordMode === 'E') {
            input.addresses = this.selectedCustomerAddresses;
        }

        this._userService.save(input).subscribe({
            next: () => {
                this.drawer.close();
                this.getGridData();
                this.uiService.showToastr('Success', 'Customer saved successfully', 'success');
            },
            error: () => {
                this.uiService.showToastr('Error', 'Failed to save customer', 'error');
            }
        });
    }

    // ================= PASSWORD RESET =================
    resetPassword(row: any) {
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
        this._userService.resetPassword(user.id, newPassword).subscribe({
            next: () => {
                this.uiService.showToastr('Success', 'Password reset successfully', 'success');
                this.closeResetDialog();
                this.getGridData();
            },
            error: () => {
                this.uiService.showToastr('Error', 'Failed to reset password', 'error');
            }
        });
    }

    openAddressDialog(address?: any) {
        this.addressForm.reset({
            country: 'India',
            isDefault: false
        });
        if (address) {
            this.addressForm.patchValue(address);
        }
        this._dialogRef = this._dialog.open(this.addressFormTpl, {
            data: address,
            width: '500px'
        });
    }

    closeAddressDialog() {
        if (this._dialogRef) {
            this._dialogRef.close();
        }
    }

    onAddressSubmit(existingAddress?: any) {
        if (this.addressForm.invalid) {
            return;
        }
        const val = this.addressForm.getRawValue();
        if (existingAddress) {
            const index = this.selectedCustomerAddresses.findIndex(a => a.id === existingAddress.id || (a.addressName === existingAddress.addressName && a.fullName === existingAddress.fullName));
            if (index > -1) {
                if (val.isDefault) {
                    this.selectedCustomerAddresses.forEach(a => a.isDefault = false);
                }
                this.selectedCustomerAddresses[index] = { ...this.selectedCustomerAddresses[index], ...val };
            }
        } else {
            val.id = val.id || Date.now();
            if (val.isDefault) {
                this.selectedCustomerAddresses.forEach(a => a.isDefault = false);
            }
            this.selectedCustomerAddresses.push(val);
        }
        this.closeAddressDialog();
    }

    deleteAddress(address: any) {
        this.selectedCustomerAddresses = this.selectedCustomerAddresses.filter(a => a !== address);
    }

    onCancelClicked() {
        this.drawer.close();
    }
}
