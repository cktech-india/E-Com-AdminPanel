import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs';

// Angular Material Modules
import { MatButtonModule } from '@angular/material/button';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';

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
        MatIconModule, FuseAlertComponent, FuseDrawerComponent,
        MatTooltipModule
    ]
})
export class BillingComponent implements OnInit {

    @ViewChild('billingFormTpl') drawer!: FuseDrawerComponent;

    inputForm!: FormGroup;
    table!: CkTable;

    searchControl = new FormControl('');

    allBillings: any[] = [];
    selectedBillingItems: any[] = [];
    allBillingDetails: any[] = [];

    // ===== Summary Stats =====
    stats = {
        totalInvoices: 0,
        totalRevenue: 0,
        totalCgst: 0,
        totalSgst: 0,
        totalIgst: 0
    };

    constructor(
        private _service: EcommerceService,
        protected uiService: UiService
    ) {
        this.searchControl.valueChanges
            .pipe(startWith(''), debounceTime(400), distinctUntilChanged(), map(v => v || ''))
            .subscribe(() => this.applyFilter());
    }

    ngOnInit(): void {
        this.initializeForm();
        this.loadBillingDetails();
        this.getGridData();
    }

    initializeForm() {
        this.inputForm = new FormGroup({
            id:              new FormControl(null),
            customerName:    new FormControl({ value: '', disabled: true }),
            customerAddress: new FormControl({ value: '', disabled: true }),
            mobileNo:        new FormControl({ value: '', disabled: true }),
            state:           new FormControl({ value: '', disabled: true }),
            stateCode:       new FormControl({ value: '', disabled: true }),
            grandTotal:      new FormControl({ value: '', disabled: true }),
            cgst:            new FormControl({ value: '', disabled: true }),
            sgst:            new FormControl({ value: '', disabled: true }),
            igst:            new FormControl({ value: '', disabled: true }),
            createdDate:     new FormControl({ value: '', disabled: true })
        });

        this.table = {
            gridData: [],
            columns: [
                {
                    header: 'Invoice ID',
                    column: 'id',
                    formatter: (v) => `<span class="font-bold text-slate-600 text-xs">#${v}</span>`
                },
                {
                    header: 'Customer',
                    column: 'customerName',
                    formatter: (v, row) => `
                        <div class="font-semibold text-slate-800">${v || '—'}</div>
                        <div class="text-[10px] text-slate-400">${row.mobileNo || ''}</div>`
                },
                {
                    header: 'State',
                    column: 'state',
                    formatter: (v, row) => `<span class="text-slate-600 text-xs">${v || '—'} (${row.stateCode || ''})</span>`
                },
                {
                    header: 'GST Breakdown',
                    column: 'cgst',
                    formatter: (v, row) => `
                        <div class="text-[10px] text-slate-500 leading-4">
                          <span class="font-semibold">C:</span> ₹${Number(row.cgst || 0).toFixed(2)}
                          &nbsp;<span class="font-semibold">S:</span> ₹${Number(row.sgst || 0).toFixed(2)}
                          &nbsp;<span class="font-semibold">I:</span> ₹${Number(row.igst || 0).toFixed(2)}
                        </div>`
                },
                {
                    header: 'Grand Total',
                    column: 'grandTotal',
                    formatter: (v) => `<span class="font-extrabold text-slate-900">₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>`
                },
                {
                    header: 'Invoice Date',
                    column: 'createdDate',
                    formatter: (v) => `<span class="text-slate-500 text-xs whitespace-nowrap">${this.uiService.getDateFormat(v, 'dd MMM yyyy') || v}</span>`
                }
            ],
            actions: [
                {
                    label: 'View Invoice',
                    icon: 'receipt_long',
                    action: (row) => this.viewBilling(row)
                },
                {
                    label: 'Delete Invoice',
                    icon: 'delete',
                    color: 'warn',
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
            next: (res) => { this.allBillingDetails = res || []; }
        });
    }

    getGridData() {
        this.table.loading = true;
        this.table = { ...this.table };
        this._service.getBillings().subscribe({
            next: (res: any[]) => {
                this.allBillings = res || [];
                this.computeStats(this.allBillings);
                this.applyFilter();
            },
            error: () => {
                this.table.loading = false;
                this.table = { ...this.table };
            }
        });
    }

    applyFilter() {
        const search = (this.searchControl.value || '').toLowerCase();
        this.table.gridData = this.allBillings.filter(item =>
            !search ||
            (item.customerName && item.customerName.toLowerCase().includes(search)) ||
            (item.mobileNo && item.mobileNo.includes(search))
        );
        this.table.loading = false;
        this.table = { ...this.table };
    }

    computeStats(billings: any[]) {
        this.stats.totalInvoices = billings.length;
        this.stats.totalRevenue  = billings.reduce((s, b) => s + (Number(b.grandTotal) || 0), 0);
        this.stats.totalCgst     = billings.reduce((s, b) => s + (Number(b.cgst) || 0), 0);
        this.stats.totalSgst     = billings.reduce((s, b) => s + (Number(b.sgst) || 0), 0);
        this.stats.totalIgst     = billings.reduce((s, b) => s + (Number(b.igst) || 0), 0);
    }

    get totalGst(): number {
        return this.stats.totalCgst + this.stats.totalSgst + this.stats.totalIgst;
    }

    get drawerGst(): number {
        const v = this.inputForm.getRawValue();
        return (Number(v.cgst) || 0) + (Number(v.sgst) || 0) + (Number(v.igst) || 0);
    }

    get drawerLineTotal(): number {
        return this.selectedBillingItems.reduce((s, i) => s + (Number(i.rowTotal) || 0), 0);
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
