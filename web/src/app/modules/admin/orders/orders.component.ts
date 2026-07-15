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
    selector: 'app-orders',
    templateUrl: './orders.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        MatButtonModule, FormsModule, ReactiveFormsModule,
        MatCardContent, MatCard, MatOptionModule, MatFormFieldModule,
        MatInputModule, MatSelectModule, CommonModule,
        MatIconModule, FuseAlertComponent, FuseDrawerComponent
    ]
})
export class OrdersComponent implements OnInit {

    @ViewChild('orderFormTpl') drawer!: FuseDrawerComponent;

    inputForm!: FormGroup;
    table!: CkTable;

    searchControl = new FormControl('');
    filterValue = {
        searchValue: ''
    };

    selectedOrderItems: any[] = [];
    allOrderItems: any[] = [];

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
        this.loadOrderItems();
        this.getGridData();
    }

    initializeForm() {
        this.inputForm = new FormGroup({
            id: new FormControl(null),
            orderNumber: new FormControl({ value: '', disabled: true }),
            orderDate: new FormControl({ value: '', disabled: true }),
            userId: new FormControl({ value: '', disabled: true }),
            grandTotal: new FormControl({ value: '', disabled: true }),
            shippingAddress: new FormControl({ value: '', disabled: true }),
            paymentMethod: new FormControl({ value: '', disabled: true }),
            paymentStatus: new FormControl('', Validators.required),
            orderStatus: new FormControl('', Validators.required)
        });

        this.table = {
            gridData: [],
            columns: [
                { header: 'Order No', column: 'orderNumber' },
                { 
                    header: 'Date', 
                    column: 'orderDate',
                    formatter: (v) => this.uiService.getDateFormat(v, 'dd-MMM-yyyy hh:mm a') || v
                },
                { 
                    header: 'Total', 
                    column: 'grandTotal',
                    formatter: (v) => `₹${Number(v).toFixed(2)}`
                },
                { header: 'Payment Method', column: 'paymentMethod' },
                { 
                    header: 'Payment Status', 
                    column: 'paymentStatus',
                    formatter: (v) => v || 'PENDING'
                },
                { header: 'Order Status', column: 'orderStatus' }
            ],
            actions: [
                {
                    label: 'View / Manage',
                    icon: 'visibility',
                    action: (row) => this.viewOrder(row)
                },
                {
                    label: 'Delete',
                    icon: 'delete',
                    confirm: true,
                    confirmTitle: 'Delete Order',
                    confirmMessage: 'Are you sure you want to delete this order record?',
                    action: (row) => this.deleteRow(row)
                }
            ],
            isShowFilter: true,
            loading: false
        };
    }

    loadOrderItems() {
        this._service.getOrderItems().subscribe({
            next: (res) => {
                this.allOrderItems = res || [];
            }
        });
    }

    getGridData() {
        this.table.loading = true;
        this.table = { ...this.table };
        this._service.getOrders().subscribe({
            next: (res: any[]) => {
                const search = this.filterValue.searchValue.toLowerCase();
                this.table.gridData = (res || []).filter(item => 
                    !search || 
                    (item.orderNumber && item.orderNumber.toLowerCase().includes(search)) ||
                    (item.orderStatus && item.orderStatus.toLowerCase().includes(search))
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

        // Get raw value because we want disabled fields too when saving
        const input = this.inputForm.getRawValue();
        input.recordMode = 'E'; // Editing order status

        this._service.saveOrder(input).subscribe({
            next: () => {
                this.drawer.close();
                this.getGridData();
                this.uiService.showToastr('Success', 'Order status updated successfully', 'success');
            },
            error: () => {
                this.uiService.showToastr('Error', 'System error occurred while updating order', 'error');
            }
        });
    }

    onCancelClicked() {
        this.drawer.close();
    }
}
