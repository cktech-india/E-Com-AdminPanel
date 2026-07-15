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
import { MatDividerModule } from '@angular/material/divider';

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
        MatIconModule, FuseAlertComponent, FuseDrawerComponent,
        MatTooltipModule, MatDividerModule
    ]
})
export class InventoryComponent implements OnInit {

    @ViewChild('inventoryFormTpl') drawer!: FuseDrawerComponent;

    inputForm!: FormGroup;
    table!: CkTable;
    recordMode: string = 'E';

    searchControl = new FormControl('');
    filterValue = { searchValue: '' };

    products: any[] = [];
    stockLogs: any[] = [];
    filteredStockLogs: any[] = [];
    allInventory: any[] = [];

    // ===== Summary Stats =====
    stats = {
        total: 0,
        inStock: 0,
        lowStock: 0,
        outOfStock: 0
    };

    // ===== Live Preview =====
    get previewNewQty(): number {
        const v = this.inputForm?.getRawValue();
        if (!v) return 0;
        const adj = Number(v.adjustQty) || 0;
        const current = Number(v.quantityOnHand) || 0;
        if (adj <= 0) return current;
        return v.adjustType === 'ADD' ? current + adj : Math.max(0, current - adj);
    }

    get previewAvailable(): number {
        return Math.max(0, this.previewNewQty - (Number(this.inputForm?.getRawValue()?.reservedQuantity) || 0));
    }

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
                this.applyFilter();
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
            adjustType: new FormControl('ADD'),
            adjustQty: new FormControl(0, [Validators.min(0)]),
            adjustRemarks: new FormControl('')
        });

        this.table = {
            gridData: [],
            columns: [
                {
                    header: 'Product Name',
                    column: 'productId',
                    formatter: (v, row) => {
                        const prod = this.products.find(p => p.id === v);
                        const name = prod ? prod.productName : `Product ID: ${v}`;
                        const avail = row.quantityOnHand - row.reservedQuantity;
                        if (avail <= 0 || avail <= row.reorderLevel) {
                            return `<span class="flex items-center gap-1.5 font-semibold text-slate-900">${name}<span class="inline-block w-2 h-2 rounded-full bg-rose-500 animate-pulse flex-shrink-0" title="Needs Reorder"></span></span>`;
                        }
                        return `<span class="font-medium text-slate-800">${name}</span>`;
                    }
                },
                {
                    header: 'On Hand',
                    column: 'quantityOnHand',
                    formatter: (v) => `<span class="font-semibold">${v}</span>`
                },
                {
                    header: 'Reserved',
                    column: 'reservedQuantity',
                    formatter: (v) => `<span class="text-slate-500">${v}</span>`
                },
                {
                    header: 'Available',
                    column: 'available',
                    formatter: (v, row) => {
                        const avail = row.quantityOnHand - row.reservedQuantity;
                        if (avail <= 0) {
                            return `<strong class="text-rose-600 font-bold">${avail}</strong>`;
                        }
                        if (avail <= row.reorderLevel) {
                            return `<strong class="text-amber-600 font-bold">${avail}</strong>`;
                        }
                        return `<span class="text-emerald-700 font-semibold">${avail}</span>`;
                    }
                },
                {
                    header: 'Reorder Point',
                    column: 'reorderLevel',
                    formatter: (v) => `<span class="text-slate-500 text-xs">≤ ${v}</span>`
                },
                {
                    header: 'Stock Status',
                    column: 'status',
                    formatter: (v, row) => {
                        const avail = row.quantityOnHand - row.reservedQuantity;
                        if (avail <= 0) {
                            return `<span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide bg-rose-100 text-rose-800 border border-rose-200">OUT OF STOCK</span>`;
                        }
                        if (avail <= row.reorderLevel) {
                            return `<span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide bg-amber-100 text-amber-800 border border-amber-200">LOW STOCK</span>`;
                        }
                        return `<span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide bg-emerald-100 text-emerald-800 border border-emerald-200">IN STOCK</span>`;
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
                this.allInventory = res || [];
                this.computeStats(this.allInventory);
                this.applyFilter();
            },
            error: () => {
                this.table.loading = false;
                this.table = { ...this.table };
            }
        });
    }

    applyFilter() {
        const search = this.filterValue.searchValue.toLowerCase();
        this.table.gridData = this.allInventory.filter(item => {
            const prod = this.products.find(p => p.id === item.productId);
            const prodName = prod ? prod.productName.toLowerCase() : '';
            return !search || prodName.includes(search);
        });
        this.table.loading = false;
        this.table = { ...this.table };
    }

    computeStats(inventory: any[]) {
        this.stats.total = inventory.length;
        this.stats.inStock = 0;
        this.stats.lowStock = 0;
        this.stats.outOfStock = 0;
        inventory.forEach(item => {
            const avail = item.quantityOnHand - item.reservedQuantity;
            if (avail <= 0) {
                this.stats.outOfStock++;
            } else if (avail <= item.reorderLevel) {
                this.stats.lowStock++;
            } else {
                this.stats.inStock++;
            }
        });
    }

    editInventory(row: any) {
        this.recordMode = 'E';
        this.inputForm.patchValue(row);
        this.inputForm.get('adjustQty')?.setValue(0);
        this.inputForm.get('adjustRemarks')?.setValue('');
        this.inputForm.get('adjustType')?.setValue('ADD');
        this.filteredStockLogs = this.stockLogs
            .filter(log => log.productId === row.productId)
            .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());
        this.drawer.open();
    }

    getSelectedProductName(): string {
        const id = this.inputForm?.get('productId')?.value;
        const prod = this.products.find(p => p.id === id);
        return prod ? prod.productName : '';
    }

    onSubmitClicked() {
        if (!this.inputForm.valid) {
            this.uiService.showToastr('Error', 'Invalid stock data', 'error');
            return;
        }

        const formVal = this.inputForm.getRawValue();
        const adj = Number(formVal.adjustQty) || 0;
        let finalQty = Number(formVal.quantityOnHand);

        if (adj > 0) {
            if (formVal.adjustType === 'ADD') {
                finalQty += adj;
            } else if (formVal.adjustType === 'SUBTRACT') {
                finalQty = Math.max(0, finalQty - adj);
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
                if (adj > 0) {
                    const logRecord = {
                        productId: formVal.productId,
                        transactionType: formVal.adjustType === 'ADD' ? 'RECEIVE' : 'ADJUST_OUT',
                        quantity: adj,
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
