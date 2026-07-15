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
import { CommonModule } from '@angular/common';

// Fuse Components
import { FuseDrawerComponent } from '@fuse/components/drawer';
import { CkTable, FuseAlertComponent } from '@fuse/components/table-grid/table-grid.component';

// Services
import { EcommerceService } from '../ecommerce.service';
import { UiService } from '@services/ui.service';

@Component({
    selector: 'app-billing',
    templateUrl: './billing.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        MatButtonModule, FormsModule, ReactiveFormsModule,
        MatCardContent, MatCard, MatOptionModule, MatFormFieldModule,
        MatInputModule, CommonModule,
        MatIconModule, FuseAlertComponent, FuseDrawerComponent
    ]
})
export class BillingComponent implements OnInit {

    @ViewChild('billingFormTpl') drawer!: FuseDrawerComponent;

    inputForm!: FormGroup;
    table!: CkTable;

    searchControl = new FormControl('');
    filterValue = {
        searchValue: ''
    };

    selectedBillingItems: any[] = [];
    allBillingDetails: any[] = [];

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
        this.loadBillingDetails();
        this.getGridData();
    }

    initializeForm() {
        this.inputForm = new FormGroup({
            id: new FormControl(null),
            customerName: new FormControl({ value: '', disabled: true }),
            customerAddress: new FormControl({ value: '', disabled: true }),
            mobileNo: new FormControl({ value: '', disabled: true }),
            state: new FormControl({ value: '', disabled: true }),
            stateCode: new FormControl({ value: '', disabled: true }),
            grandTotal: new FormControl({ value: '', disabled: true }),
            cgst: new FormControl({ value: '', disabled: true }),
            sgst: new FormControl({ value: '', disabled: true }),
            igst: new FormControl({ value: '', disabled: true }),
            createdDate: new FormControl({ value: '', disabled: true })
        });

        this.table = {
            gridData: [],
            columns: [
                { header: 'Invoice ID', column: 'id' },
                { header: 'Customer', column: 'customerName' },
                { header: 'Mobile', column: 'mobileNo' },
                { 
                    header: 'Total Amount', 
                    column: 'grandTotal',
                    formatter: (v) => `₹${Number(v).toFixed(2)}`
                },
                { header: 'State', column: 'state' },
                { 
                    header: 'Invoice Date', 
                    column: 'createdDate',
                    formatter: (v) => this.uiService.getDateFormat(v, 'dd-MMM-yyyy hh:mm a') || v
                }
            ],
            actions: [
                {
                    label: 'View Details',
                    icon: 'visibility',
                    action: (row) => this.viewBilling(row)
                },
                {
                    label: 'Delete Invoice',
                    icon: 'delete',
                    confirm: true,
                    confirmTitle: 'Delete Invoice',
                    confirmMessage: 'Are you sure you want to permanently delete this billing record?',
                    action: (row) => this.deleteRow(row)
                }
            ],
            isShowFilter: true,
            loading: false
        };
    }

    loadBillingDetails() {
        this._service.getBillingDetails().subscribe({
            next: (res) => {
                this.allBillingDetails = res || [];
            }
        });
    }

    getGridData() {
        this.table.loading = true;
        this.table = { ...this.table };
        this._service.getBillings().subscribe({
            next: (res: any[]) => {
                const search = this.filterValue.searchValue.toLowerCase();
                this.table.gridData = (res || []).filter(item => 
                    !search || 
                    (item.customerName && item.customerName.toLowerCase().includes(search)) ||
                    (item.mobileNo && item.mobileNo.toLowerCase().includes(search))
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

    viewBilling(row: any) {
        this.inputForm.patchValue(row);
        this.selectedBillingItems = this.allBillingDetails.filter(item => item.billingId === row.id);
        this.drawer.open();
    }

    deleteRow(row: any) {
        this._service.deleteBilling(row.id).subscribe({
            next: () => {
                this.getGridData();
                this.uiService.showToastr('Success', 'Invoice deleted successfully', 'success');
            },
            error: () => {
                this.uiService.showToastr('Error', 'Failed to delete invoice record', 'error');
            }
        });
    }

    onCancelClicked() {
        this.drawer.close();
    }
}
