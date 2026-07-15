import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs';

// Angular Material Modules
import { MatButtonModule } from '@angular/material/button';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';

// Fuse Components
import { FuseDrawerComponent } from '@fuse/components/drawer';
import { CkTable, FuseAlertComponent } from '@fuse/components/table-grid/table-grid.component';

// Services
import { EcommerceService } from '../ecommerce.service';
import { UiService } from '@services/ui.service';

@Component({
    selector: 'app-contact-inquiries',
    templateUrl: './contact-inquiries.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        MatButtonModule, FormsModule, ReactiveFormsModule,
        MatCardContent, MatCard, MatOptionModule, MatFormFieldModule,
        MatInputModule, MatSelectModule, CommonModule,
        MatIconModule, FuseAlertComponent, FuseDrawerComponent
    ]
})
export class ContactInquiriesComponent implements OnInit {

    @ViewChild('inquiryFormTpl') drawer!: FuseDrawerComponent;

    inputForm!: FormGroup;
    table!: CkTable;

    searchControl = new FormControl('');
    filterValue = {
        searchValue: ''
    };

    branches: any[] = [];

    constructor(
        private _service: EcommerceService,
        protected uiService: UiService
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

    ngOnInit(): void {
        this.initializeForm();
        this.loadBranches();
        this.getGridData();
    }

    initializeForm() {
        this.inputForm = new FormGroup({
            id: new FormControl(null),
            branchId: new FormControl({ value: null, disabled: true }),
            fullName: new FormControl({ value: '', disabled: true }),
            email: new FormControl({ value: '', disabled: true }),
            subject: new FormControl({ value: '', disabled: true }),
            message: new FormControl({ value: '', disabled: true }),
            status: new FormControl('NEW', Validators.required)
        });

        this.table = {
            gridData: [],
            columns: [
                { header: 'ID', column: 'id', width: '60px' },
                { header: 'Name', column: 'fullName' },
                { header: 'Email', column: 'email' },
                { header: 'Subject', column: 'subject' },
                { header: 'Status', column: 'status' }
            ],
            actions: [
                {
                    label: 'View / Manage',
                    icon: 'visibility',
                    action: (row) => this.viewInquiry(row)
                },
                {
                    label: 'Delete Log',
                    icon: 'delete',
                    confirm: true,
                    confirmTitle: 'Delete Inquiry',
                    confirmMessage: 'Are you sure you want to permanently delete this contact inquiry log?',
                    action: (row) => this.deleteRow(row)
                }
            ],
            isShowFilter: true,
            loading: false
        };
    }

    loadBranches() {
        this._service.getBranches().subscribe({
            next: (res) => {
                this.branches = res || [];
            }
        });
    }

    getGridData() {
        this.table.loading = true;
        this.table = { ...this.table };
        this._service.getContactInquiries().subscribe({
            next: (res: any[]) => {
                const search = this.filterValue.searchValue.toLowerCase();
                this.table.gridData = (res || []).filter(item => 
                    !search || 
                    (item.fullName && item.fullName.toLowerCase().includes(search)) ||
                    (item.subject && item.subject.toLowerCase().includes(search)) ||
                    (item.email && item.email.toLowerCase().includes(search))
                );
                this.table.loading = false;
                this.table = { ...this.table };
            },
            error: () => {
                this.table.loading = false;
                this.table = { ...this.table };
            }
        });
    }

    viewInquiry(row: any) {
        this.inputForm.patchValue(row);
        this.drawer.open();
    }

    deleteRow(row: any) {
        this._service.deleteContactInquiry(row.id).subscribe({
            next: () => {
                this.getGridData();
                this.uiService.showToastr('Success', 'Inquiry deleted successfully', 'success');
            },
            error: () => {
                this.uiService.showToastr('Error', 'Failed to delete inquiry log', 'error');
            }
        });
    }

    onSubmitClicked() {
        if (!this.inputForm.valid) {
            this.uiService.showToastr('Error', 'Invalid status configuration', 'error');
            return;
        }

        const input = this.inputForm.getRawValue();
        input.recordMode = 'E'; // Edit Mode for changing status

        this._service.saveContactInquiry(input).subscribe({
            next: () => {
                this.drawer.close();
                this.getGridData();
                this.uiService.showToastr('Success', 'Inquiry status updated', 'success');
            },
            error: () => {
                this.uiService.showToastr('Error', 'Failed to update status', 'error');
            }
        });
    }

    onCancelClicked() {
        this.drawer.close();
    }
}
