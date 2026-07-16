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
    selector: 'app-carts',
    templateUrl: './carts.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        CommonModule, MatButtonModule, FormsModule, ReactiveFormsModule,
        MatCardContent, MatCard, MatFormFieldModule,
        MatInputModule, MatIconModule, FuseAlertComponent, FuseDrawerComponent
    ]
})
export class CartsComponent implements OnInit {

    @ViewChild('cartDetailsTpl') drawer!: FuseDrawerComponent;

    table!: CkTable;
    searchControl = new FormControl('');
    filterValue = {
        searchValue: ''
    };

    products: any[] = [];
    customers: any[] = [];
    selectedCartItems: any[] = [];
    selectedCartCustomer: any = null;

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
                { header: 'Cart ID', column: 'id' },
                { 
                    header: 'Customer', 
                    column: 'userId',
                    formatter: (v) => {
                        const cust = this.customers.find(c => c.id === v);
                        return cust ? `${cust.firstName} ${cust.lastName || ''} (${cust.email})` : `User ID: ${v}`;
                    }
                },
                { 
                    header: 'Unique Items', 
                    column: 'items',
                    formatter: (v) => `${(v || []).length} Item(s)`
                },
                { 
                    header: 'Total Quantity', 
                    column: 'items',
                    formatter: (v) => {
                        return (v || []).reduce((acc, curr) => acc + (curr.quantity || 0), 0);
                    }
                }
            ],
            actions: [
                {
                    label: 'View Details',
                    icon: 'visibility',
                    action: (row) => this.viewCartDetails(row)
                },
                {
                    label: 'Delete Cart',
                    icon: 'delete',
                    confirm: true,
                    confirmTitle: 'Delete Shopping Cart',
                    confirmMessage: 'Are you sure you want to delete this customer cart?',
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
        this._service.getCarts().subscribe({
            next: (res: any[]) => {
                const search = this.filterValue.searchValue.toLowerCase();
                this.table.gridData = (res || []).filter(item => {
                    const cust = this.customers.find(c => c.id === item.userId);
                    const custName = cust ? `${cust.firstName} ${cust.lastName || ''}`.toLowerCase() : '';
                    const custEmail = cust ? cust.email.toLowerCase() : '';
                    return !search || 
                        custName.includes(search) || 
                        custEmail.includes(search) ||
                        String(item.id).includes(search);
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

    viewCartDetails(row: any) {
        this.selectedCartCustomer = this.customers.find(c => c.id === row.userId) || { firstName: 'Unknown', lastName: 'Customer', email: 'N/A' };
        this.selectedCartItems = (row.items || []).map(item => {
            const prod = this.products.find(p => p.id === item.productId);
            return {
                ...item,
                productName: prod ? prod.productName : `Product ID: ${item.productId}`,
                productCode: prod ? prod.productCode : 'N/A',
                price: prod ? prod.price : 0
            };
        });
        this.drawer.open();
    }

    deleteRow(row: any) {
        this._service.deleteCart(row.id).subscribe({
            next: () => {
                this.getGridData();
                this.uiService.showToastr('Success', 'Cart deleted successfully', 'success');
            },
            error: () => {
                this.uiService.showToastr('Error', 'Failed to delete cart', 'error');
            }
        });
    }

    onCloseClicked() {
        this.drawer.close();
    }
}
