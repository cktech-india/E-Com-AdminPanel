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

// Fuse Components
import { FuseDrawerComponent } from '@fuse/components/drawer';
import { CkTable, FuseAlertComponent } from '@fuse/components/table-grid/table-grid.component';

// Services
import { EcommerceService } from '../../ecommerce.service';
import { UiService } from '@services/ui.service';

@Component({
    selector: 'app-stock-logs',
    templateUrl: './stock-logs.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        MatButtonModule, FormsModule, ReactiveFormsModule,
        MatCardContent, MatCard, MatOptionModule, MatFormFieldModule,
        MatInputModule, MatSelectModule,
        MatIconModule, FuseAlertComponent, FuseDrawerComponent
    ]
})
export class StockLogsComponent implements OnInit {

    @ViewChild('logFormTpl') drawer!: FuseDrawerComponent;

    inputForm!: FormGroup;
    table!: CkTable;
    recordMode: string = 'C';

    searchControl = new FormControl('');
    filterValue = {
        searchValue: ''
    };

    products: any[] = [];

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
        this.getGridData();
    }

    initializeForm() {
        this.inputForm = new FormGroup({
            id: new FormControl(null),
            productId: new FormControl(null, Validators.required),
            changeAmount: new FormControl(0, [Validators.required]),
            reason: new FormControl('adjustment', Validators.required),
            referenceId: new FormControl(null)
        });

        this.table = {
            gridData: [],
            columns: [
                { header: 'Log ID', column: 'id' },
                { 
                    header: 'Product', 
                    column: 'productId',
                    formatter: (v) => {
                        const prod = this.products.find(p => p.id === v);
                        return prod ? `${prod.productName} (${prod.productCode})` : v;
                    }
                },
                { 
                    header: 'Change Amount', 
                    column: 'changeAmount',
                    formatter: (v) => v > 0 ? `+${v}` : `${v}`
                },
                { header: 'Reason', column: 'reason' },
                { header: 'Ref ID', column: 'referenceId' },
                { header: 'Log Timestamp', column: 'createdAt' }
            ],
            actions: [
                {
                    label: 'Delete Log',
                    icon: 'delete',
                    confirm: true,
                    confirmTitle: 'Delete Stock Log',
                    confirmMessage: 'Are you sure you want to delete this log entry?',
                    action: (row) => this.deleteRow(row)
                }
            ],
            isShowFilter: true,
            loading: false
        };
    }

    loadProducts() {
        this._service.getActiveProducts().subscribe({
            next: (res) => {
                this.products = res || [];
                this.table = { ...this.table };
            }
        });
    }

    getGridData() {
        this.table.loading = true;
        this.table = { ...this.table };
        this._service.getStockLogs().subscribe({
            next: (res: any[]) => {
                const search = this.filterValue.searchValue.toLowerCase();
                this.table.gridData = (res || []).filter(item => {
                    const prod = this.products.find(p => p.id === item.productId);
                    const prodName = prod ? prod.productName.toLowerCase() : '';
                    return !search || 
                        (item.reason && item.reason.toLowerCase().includes(search)) ||
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

    newRowClicked() {
        this.recordMode = 'C';
        this.inputForm.reset({
            changeAmount: 0,
            reason: 'adjustment'
        });
        this.drawer.open();
    }

    deleteRow(row: any) {
        this._service.deleteStockLog(row.id).subscribe({
            next: () => {
                this.getGridData();
                this.uiService.showToastr('Success', 'Stock log entry deleted', 'success');
            },
            error: () => {
                this.uiService.showToastr('Error', 'Failed to delete entry', 'error');
            }
        });
    }

    onSubmitClicked() {
        if (!this.inputForm.valid) {
            this.uiService.showToastr('Error', 'Fill required fields', 'error');
            return;
        }

        const input = this.inputForm.getRawValue();
        input.recordMode = this.recordMode;

        this._service.saveStockLog(input).subscribe({
            next: () => {
                this.drawer.close();
                this.getGridData();
                this.uiService.showToastr('Success', 'Stock adjustment recorded successfully', 'success');
            },
            error: () => {
                this.uiService.showToastr('Error', 'System error occurred while recording stock adjustment', 'error');
            }
        });
    }

    onCancelClicked() {
        this.drawer.close();
    }
}
