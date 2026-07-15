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
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';

// Fuse Components
import { FuseDrawerComponent } from '@fuse/components/drawer';
import { CkTable, FuseAlertComponent } from '@fuse/components/table-grid/table-grid.component';

// Services
import { EcommerceService } from '../ecommerce.service';
import { UiService } from '@services/ui.service';

@Component({
    selector: 'app-orders',
    templateUrl: './orders.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        MatButtonModule, FormsModule, ReactiveFormsModule,
        MatCardContent, MatCard, MatOptionModule, MatFormFieldModule,
        MatInputModule, MatSelectModule, CommonModule,
        MatIconModule, FuseAlertComponent, FuseDrawerComponent,
        MatTooltipModule, MatChipsModule
    ]
})
export class OrdersComponent implements OnInit {

    @ViewChild('orderFormTpl') drawer!: FuseDrawerComponent;

    inputForm!: FormGroup;
    table!: CkTable;

    searchControl = new FormControl('');
    statusFilter = new FormControl('ALL');

    allOrders: any[] = [];
    selectedOrderItems: any[] = [];
    allOrderItems: any[] = [];

    // ===== Summary Stats =====
    stats = { total: 0, pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 };

    readonly ORDER_STATUSES = ['ALL', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

    constructor(
        private _service: EcommerceService,
        protected uiService: UiService
    ) {
        this.searchControl.valueChanges
            .pipe(startWith(''), debounceTime(400), distinctUntilChanged(), map(v => v || ''))
            .subscribe(() => this.applyFilter());

        this.statusFilter.valueChanges
            .subscribe(() => this.applyFilter());
    }

    ngOnInit(): void {
        this.initializeForm();
        this.loadOrderItems();
        this.getGridData();
    }

    initializeForm() {
        this.inputForm = new FormGroup({
            id: new FormControl(null),
            orderNumber:    new FormControl({ value: '', disabled: true }),
            orderDate:      new FormControl({ value: '', disabled: true }),
            userId:         new FormControl({ value: '', disabled: true }),
            grandTotal:     new FormControl({ value: '', disabled: true }),
            shippingAddress:new FormControl({ value: '', disabled: true }),
            paymentMethod:  new FormControl({ value: '', disabled: true }),
            paymentStatus:  new FormControl('', Validators.required),
            orderStatus:    new FormControl('', Validators.required)
        });

        this.table = {
            gridData: [],
            columns: [
                {
                    header: 'Order No',
                    column: 'orderNumber',
                    formatter: (v) => `<span class="font-bold text-slate-700">${v || '—'}</span>`
                },
                {
                    header: 'Date',
                    column: 'orderDate',
                    formatter: (v) => `<span class="text-slate-500 text-xs whitespace-nowrap">${this.uiService.getDateFormat(v, 'dd MMM yyyy') || v}</span>`
                },
                {
                    header: 'Amount',
                    column: 'grandTotal',
                    formatter: (v) => `<span class="font-bold text-slate-800">₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>`
                },
                {
                    header: 'Payment',
                    column: 'paymentMethod',
                    formatter: (v) => `<span class="text-slate-600 text-xs">${v || '—'}</span>`
                },
                {
                    header: 'Payment Status',
                    column: 'paymentStatus',
                    formatter: (v) => this.formatPaymentBadge(v)
                },
                {
                    header: 'Order Status',
                    column: 'orderStatus',
                    formatter: (v) => this.formatOrderBadge(v)
                }
            ],
            actions: [
                {
                    label: 'View & Manage',
                    icon: 'open_in_new',
                    action: (row) => this.viewOrder(row)
                },
                {
                    label: 'Delete Order',
                    icon: 'delete',
                    color: 'warn',
                    confirm: true,
                    confirmTitle: 'Delete Order',
                    confirmMessage: 'Are you sure you want to permanently delete this order?',
                    action: (row) => this.deleteRow(row)
                }
            ],
            isShowFilter: true,
            loading: false
        };
    }

    formatOrderBadge(status: string): string {
        const map: Record<string, string> = {
            'PENDING':    'bg-amber-100 text-amber-800 border-amber-200',
            'PROCESSING': 'bg-blue-100 text-blue-800 border-blue-200',
            'SHIPPED':    'bg-indigo-100 text-indigo-800 border-indigo-200',
            'DELIVERED':  'bg-emerald-100 text-emerald-800 border-emerald-200',
            'CANCELLED':  'bg-rose-100 text-rose-800 border-rose-200',
        };
        const cls = map[status] || 'bg-slate-100 text-slate-600 border-slate-200';
        return `<span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide border ${cls}">${status || 'PENDING'}</span>`;
    }

    formatPaymentBadge(status: string): string {
        const map: Record<string, string> = {
            'PAID':     'bg-emerald-100 text-emerald-800 border-emerald-200',
            'PENDING':  'bg-amber-100 text-amber-800 border-amber-200',
            'REFUNDED': 'bg-purple-100 text-purple-800 border-purple-200',
            'FAILED':   'bg-rose-100 text-rose-800 border-rose-200',
        };
        const cls = map[status] || 'bg-slate-100 text-slate-600 border-slate-200';
        return `<span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide border ${cls}">${status || 'PENDING'}</span>`;
    }

    loadOrderItems() {
        this._service.getOrderItems().subscribe({
            next: (res) => { this.allOrderItems = res || []; }
        });
    }

    getGridData() {
        this.table.loading = true;
        this.table = { ...this.table };
        this._service.getOrders().subscribe({
            next: (res: any[]) => {
                this.allOrders = res || [];
                this.computeStats(this.allOrders);
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
        const statusVal = this.statusFilter.value || 'ALL';
        this.table.gridData = this.allOrders.filter(item => {
            const matchSearch = !search ||
                (item.orderNumber && item.orderNumber.toLowerCase().includes(search)) ||
                (item.orderStatus && item.orderStatus.toLowerCase().includes(search));
            const matchStatus = statusVal === 'ALL' || item.orderStatus === statusVal;
            return matchSearch && matchStatus;
        });
        this.table.loading = false;
        this.table = { ...this.table };
    }

    computeStats(orders: any[]) {
        this.stats = { total: orders.length, pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 };
        orders.forEach(o => {
            const s = (o.orderStatus || '').toUpperCase();
            if (s === 'PENDING')    this.stats.pending++;
            else if (s === 'PROCESSING') this.stats.processing++;
            else if (s === 'SHIPPED')    this.stats.shipped++;
            else if (s === 'DELIVERED')  this.stats.delivered++;
            else if (s === 'CANCELLED')  this.stats.cancelled++;
        });
    }

    get totalRevenue(): number {
        return this.allOrders
            .filter(o => o.orderStatus !== 'CANCELLED')
            .reduce((sum, o) => sum + (Number(o.grandTotal) || 0), 0);
    }

    viewOrder(row: any) {
        this.inputForm.patchValue(row);
        this.selectedOrderItems = this.allOrderItems.filter(item => item.orderId === row.id);
        this.drawer.open();
    }

    deleteRow(row: any) {
        this._service.deleteOrder(row.id).subscribe({
            next: () => {
                this.getGridData();
                this.uiService.showToastr('Success', 'Order deleted successfully', 'success');
            },
            error: () => {
                this.uiService.showToastr('Error', 'Failed to delete order', 'error');
            }
        });
    }

    onSubmitClicked() {
        if (!this.inputForm.valid) {
            this.uiService.showToastr('Error', 'Invalid status configuration', 'error');
            return;
        }
        const input = this.inputForm.getRawValue();
        input.recordMode = 'E';
        this._service.saveOrder(input).subscribe({
            next: () => {
                this.drawer.close();
                this.getGridData();
                this.uiService.showToastr('Success', 'Order status updated successfully', 'success');
            },
            error: () => {
                this.uiService.showToastr('Error', 'System error while updating order', 'error');
            }
        });
    }

    onCancelClicked() {
        this.drawer.close();
    }

    // Helper for drawer order total items count
    get orderItemCount(): number {
        return this.selectedOrderItems.reduce((s, i) => s + (Number(i.quantity) || 0), 0);
    }

    get orderItemTotal(): number {
        return this.selectedOrderItems.reduce((s, i) => s + (Number(i.rowTotal) || 0), 0);
    }
}
