import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
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
import { FuseDrawerComponent } from '@fuse/components/drawer';
import { CkTable, FuseAlertComponent } from '@fuse/components/table-grid/table-grid.component';

// Services
import { EcommerceService } from '../../ecommerce.service';
import { UserService } from '../../users/users.service';
import { UiService } from '@services/ui.service';

@Component({
    selector: 'app-wishlists',
    templateUrl: './wishlists.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        CommonModule, MatButtonModule, FormsModule, ReactiveFormsModule,
        MatCardContent, MatCard, MatFormFieldModule,
        MatInputModule, MatIconModule, FuseAlertComponent, FuseDrawerComponent
    ]
})
export class WishlistsComponent implements OnInit {

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
        this.loadInitialData();
    }

    initializeForm() {
        this.table = {
            gridData: [],
            columns: [
                { header: 'Wishlist ID', column: 'id' },
                { 
                    header: 'Customer Name', 
                    column: 'userId',
                    formatter: (v) => {
                        const cust = this.customers.find(c => c.id === v);
                        return cust ? `${cust.firstName} ${cust.lastName || ''} (${cust.email})` : `User ID: ${v}`;
                    }
                },
                { 
                    header: 'Product Name', 
                    column: 'productId',
                    formatter: (v) => {
                        const prod = this.products.find(p => p.id === v);
                        return prod ? `${prod.productName} (${prod.productCode})` : `Product ID: ${v}`;
                    }
                },
                { 
                    header: 'Product Price', 
                    column: 'productId',
                    formatter: (v) => {
                        const prod = this.products.find(p => p.id === v);
                        return prod ? `₹${Number(prod.price).toFixed(2)}` : 'N/A';
                    }
                }
            ],
            actions: [
                {
                    label: 'Remove Item',
                    icon: 'delete',
                    confirm: true,
                    confirmTitle: 'Delete Wishlist Item',
                    confirmMessage: 'Are you sure you want to delete this wishlist entry?',
                    action: (row) => this.deleteRow(row)
                }
            ],
            isShowFilter: true,
            loading: false
        };
    }

    loadInitialData() {
        this._service.getActiveProducts().subscribe({
            next: (res) => {
                this.products = res || [];
                this.getGridData();
            }
        });

        this._userService.getList().subscribe({
            next: (res) => {
                this.customers = res || [];
                this.table = { ...this.table };
            }
        });
    }

    getGridData() {
        this.table.loading = true;
        this.table = { ...this.table };
        this._service.getWishlists().subscribe({
            next: (res: any[]) => {
                const search = this.filterValue.searchValue.toLowerCase();
                this.table.gridData = (res || []).filter(item => {
                    const cust = this.customers.find(c => c.id === item.userId);
                    const custName = cust ? `${cust.firstName} ${cust.lastName || ''}`.toLowerCase() : '';
                    const prod = this.products.find(p => p.id === item.productId);
                    const prodName = prod ? prod.productName.toLowerCase() : '';
                    return !search || 
                        custName.includes(search) || 
                        prodName.includes(search);
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
        this._service.deleteWishlist(row.id).subscribe({
            next: () => {
                this.getGridData();
                this.uiService.showToastr('Success', 'Wishlist item deleted successfully', 'success');
            },
            error: () => {
                this.uiService.showToastr('Error', 'Failed to delete wishlist item', 'error');
            }
        });
    }
}
