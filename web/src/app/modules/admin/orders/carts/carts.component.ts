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
     filterValue: any = {
        pageIndex: 0,
        pageSize: 10,
        searchValue: '',
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
        this.getGridData();
    }

    initializeForm() {
        this.table = {
            gridData: [],
            columns: [
                { header: 'Product ID', column: 'productId' },
                { header: 'Product Code', column: 'productCode' },
                { header: 'Product Name', column: 'productName' },
                { header: 'Users', column: 'totalUsers' },
                { header: 'Total Quantity', column: 'totalQuantity' },
                { header: 'Wishlist Count', column: 'wishlist' }
            ],
            actions: [
                
            ],
            isShowFilter: true,
            loading: false
        };
    }

    getGridData() {
        this.table.loading = true;
        this.table = { ...this.table };
        this._service.getCartItemCountDetails().subscribe({
            next: (res: any[]) => {
                const search = this.filterValue.searchValue.toLowerCase();
                this.table.gridData = (res || []).filter(item => {
                    const name = (item.productName || '').toLowerCase();
                    const code = (item.productCode || '').toLowerCase();
                    return !search || 
                        name.includes(search) || 
                        code.includes(search) ||
                        String(item.productId).includes(search);
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

    onCloseClicked() {
        this.drawer.close();
    }
}
