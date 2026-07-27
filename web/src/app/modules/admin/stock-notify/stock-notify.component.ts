import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs';
import { CommonModule } from '@angular/common';

// Angular Material Modules
import { MatButtonModule } from '@angular/material/button';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

// Fuse Components
import { CkTable, FuseAlertComponent } from '@fuse/components/table-grid/table-grid.component';

// Services
import { EcommerceService } from '../ecommerce.service';
import { UserService } from '../users/users.service';
import { UiService } from '@services/ui.service';

@Component({
    selector: 'app-stock-notify',
    templateUrl: './stock-notify.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        CommonModule, MatButtonModule, FormsModule, ReactiveFormsModule,
        MatCardContent, MatCard, MatFormFieldModule,
        MatInputModule, MatIconModule, FuseAlertComponent
    ]
})
export class StockNotifyComponent implements OnInit {

    table!: CkTable;
    searchControl = new FormControl('');
    filterValue = {
        searchValue: ''
    };

    products: any[] = [];
    customers: any[] = [];

    constructor(
        private _service: EcommerceService,
        private _userService: UserService,
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
    }

    initializeForm() {
        this.table = {
            gridData: [],
            columns: [
                { 
                    header: 'Product Code', 
                    column: 'productCode',
                },
                { 
                    header: 'User ID', 
                    column: 'userId',
                },
                { header: 'Email ID', column: 'emailId' },
                { 
                    header: 'Request Date', 
                    column: 'createdAt',
                    formatter: (v) => v ? new Date(v).toLocaleString() : 'N/A'
                }
            ],
            // actions: [
            //     {
            //         label: 'Remove Request',
            //         icon: 'delete',
            //         confirm: true,
            //         confirmTitle: 'Delete Stock Notification Request',
            //         confirmMessage: 'Are you sure you want to delete this notification request?',
            //         action: (row) => this.deleteRow(row)
            //     }
            // ],
            isShowFilter: true,
            loading: false
        };
    }

    getGridData() {
        this.table.loading = true;
        this.table = { ...this.table };
        this._service.getStockNotifies().subscribe({
            next: (res: any[]) => {
                const search = this.filterValue.searchValue.toLowerCase();
                this.table.gridData = (res || []).filter(item => {
                    const cust = this.customers.find(c => c.id === item.userId);
                    const custName = cust ? `${cust.firstName} ${cust.lastName || ''}`.toLowerCase() : '';
                    const email = (item.emailId || '').toLowerCase();
                    return !search || 
                        custName.includes(search) || 
                        item.productCode.includes(search) ||
                        email.includes(search);
                });
                this.table.loading = false;
                this.table = { ...this.table };
            },
            error: () => {
                this.table.loading = false;
                this.table = { ...this.table };
            }
        });
    }

    deleteRow(row: any) {
        this._service.deleteStockNotify(row.id).subscribe({
            next: () => {
                this.getGridData();
                this.uiService.showToastr('Success', 'Stock notification request deleted successfully', 'success');
            },
            error: () => {
                this.uiService.showToastr('Error', 'Failed to delete notification request', 'error');
            }
        });
    }
}
