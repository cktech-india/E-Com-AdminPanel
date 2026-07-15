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
    selector: 'app-inventory',
    templateUrl: './inventory.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        MatButtonModule, FormsModule, ReactiveFormsModule,
        MatCardContent, MatCard, MatOptionModule, MatFormFieldModule,
        MatInputModule, MatSelectModule, CommonModule,
        MatIconModule, FuseAlertComponent, FuseDrawerComponent
    ]
})
export class InventoryComponent implements OnInit {

    @ViewChild('inventoryFormTpl') drawer!: FuseDrawerComponent;

    inputForm!: FormGroup;
    table!: CkTable;
    recordMode: string = 'E';

    searchControl = new FormControl('');
    filterValue = {
        searchValue: ''
    };

    products: any[] = [];
    stockLogs: any[] = [];
    filteredStockLogs: any[] = [];

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
        this.loadProducts();
        this.loadStockLogs();
        this.getGridData();
    }

    initializeForm() {
        this.inputForm = new FormGroup({
            productId: new FormControl(null, Validators.required),
            quantityOnHand: new FormControl(0, [Validators.required, Validators.min(0)]),
            reservedQuantity: new FormControl(0, [Validators.required, Validators.min(0)]),
            reorderLevel: new FormControl(10, [Validators.required, Validators.min(0)]),
            
            // For stock log adjustment
            adjustType: new FormControl('ADD'),
            adjustQty: new FormControl(0),
            adjustRemarks: new FormControl('')
        });

        this.table = {
            gridData: [],
            columns: [
                { 
                    header: 'Product Name', 
                    column: 'productId',
                    formatter: (v) => {
                        const prod = this.products.find(p => p.id === v);
                        return prod ? prod.productName : `Product ID: ${v}`;
                    }
                },
                { header: 'On Hand', column: 'quantityOnHand' },
                { header: 'Reserved', column: 'reservedQuantity' },
                { 
                    header: 'Available', 
                    column: 'available',
                    formatter: (v, row) => `${row.quantityOnHand - row.reservedQuantity}`
                },
                { header: 'Reorder Point', column: 'reorderLevel' },
                {
                    header: 'Stock Status',
                    column: 'status',
                    formatter: (v, row) => {
                        const avail = row.quantityOnHand - row.reservedQuantity;
                        if (avail <= 0) return 'OUT OF STOCK';
                        if (avail <= row.reorderLevel) return 'LOW STOCK';
                        return 'IN STOCK';
                    }
                }
            ],
            actions: [
                {
                    label: 'Update Stock & Logs',
                    icon: 'edit',
                    action: (row) => this.editInventory(row)
                }
            ],
            isShowFilter: true,
            loading: false
        };
    }

    loadProducts() {
        this._service.getProducts().subscribe({
            next: (res) => {
                this.products = res || [];
                this.table = { ...this.table };
            }
        });
    }

    loadStockLogs() {
        this._service.getStockLogs().subscribe({
            next: (res) => {
                this.stockLogs = res || [];
            }
        });
    }

    getGridData() {
        this.table.loading = true;
        this.table = { ...this.table };
        this._service.getInventory().subscribe({
            next: (res: any[]) => {
                const search = this.filterValue.searchValue.toLowerCase();
                this.table.gridData = (res || []).filter(item => {
                    const prod = this.products.find(p => p.id === item.productId);
                    const prodName = prod ? prod.productName.toLowerCase() : '';
                    return !search || prodName.includes(search);
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

    editInventory(row: any) {
        this.recordMode = 'E';
        this.inputForm.patchValue(row);
        this.inputForm.get('adjustQty')?.setValue(0);
        this.inputForm.get('adjustRemarks')?.setValue('');
        this.filteredStockLogs = this.stockLogs
            .filter(log => log.productId === row.productId)
            .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());
        this.drawer.open();
    }

    onSubmitClicked() {
        if (!this.inputForm.valid) {
            this.uiService.showToastr('Error', 'Invalid stock data', 'error');
            return;
        }

        const formVal = this.inputForm.getRawValue();
        let finalQty = formVal.quantityOnHand;

        // Perform stock adjustments if adjustQty is specified
        if (formVal.adjustQty > 0) {
            if (formVal.adjustType === 'ADD') {
                finalQty += formVal.adjustQty;
            } else if (formVal.adjustType === 'SUBTRACT') {
                finalQty = Math.max(0, finalQty - formVal.adjustQty);
            }
        }

        const input = {
            productId: formVal.productId,
            quantityOnHand: finalQty,
            reservedQuantity: formVal.reservedQuantity,
            reorderLevel: formVal.reorderLevel,
            recordMode: 'E'
        };

        this._service.saveInventory(input).subscribe({
            next: () => {
                // If adjusted, create a stock log record on the backend if available
                if (formVal.adjustQty > 0) {
                    const logRecord = {
                        productId: formVal.productId,
                        transactionType: formVal.adjustType === 'ADD' ? 'RECEIVE' : 'ADJUST_OUT',
                        quantity: formVal.adjustQty,
                        remarks: formVal.adjustRemarks || 'Manual Stock Update',
                        transactionDate: new Date()
                    };
                    this._service.saveStockLog(logRecord).subscribe({
                        next: () => this.loadStockLogs()
                    });
                }

                this.drawer.close();
                this.getGridData();
                this.uiService.showToastr('Success', 'Stock levels updated', 'success');
            },
            error: () => {
                this.uiService.showToastr('Error', 'Failed to update stock level', 'error');
            }
        });
    }

    onCancelClicked() {
        this.drawer.close();
    }
}
