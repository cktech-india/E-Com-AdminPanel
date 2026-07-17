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
import { DataImportExportComponent } from '../../../shared/components/data-import-export/data-import-export.component';

@Component({
    selector: 'app-product-recommended',
    templateUrl: './product-recommended.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        MatButtonModule, FormsModule, ReactiveFormsModule,
        MatCardContent, MatCard, MatOptionModule, MatFormFieldModule,
        MatInputModule, MatSelectModule,
        MatIconModule, FuseAlertComponent, FuseDrawerComponent,
        DataImportExportComponent
    ]
})
export class ProductRecommendedComponent implements OnInit {

    @ViewChild('recommendedFormTpl') drawer!: FuseDrawerComponent;

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
            productTag: new FormControl('Recommended', Validators.required)
        });

        this.table = {
            gridData: [],
            columns: [
                { header: 'ID', column: 'id' },
                { 
                    header: 'Product', 
                    column: 'productId',
                    formatter: (v) => {
                        const prod = this.products.find(p => p.id === v);
                        return prod ? `${prod.productName} (${prod.productCode})` : v;
                    }
                },
                { header: 'Tag (Recommendation Type)', column: 'productTag' }
            ],
            actions: [
                {
                    label: 'Edit',
                    icon: 'edit',
                    action: (row) => this.editRow(row)
                },
                {
                    label: 'Delete',
                    icon: 'delete',
                    confirm: true,
                    confirmTitle: 'Remove Recommendation',
                    confirmMessage: 'Are you sure you want to remove this recommendation?',
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
        this._service.getProductTags().subscribe({
            next: (res: any[]) => {
                const search = this.filterValue.searchValue.toLowerCase();
                this.table.gridData = (res || []).filter(item => {
                    const prod = this.products.find(p => p.id === item.productId);
                    const prodName = prod ? prod.productName.toLowerCase() : '';
                    return !search || 
                        (item.productTag && item.productTag.toLowerCase().includes(search)) ||
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
            productTag: 'Recommended'
        });
        this.drawer.open();
    }

    editRow(row: any) {
        this.recordMode = 'E';
        this.inputForm.patchValue(row);
        this.drawer.open();
    }

    deleteRow(row: any) {
        this._service.deleteProductTag(row.id).subscribe({
            next: () => {
                this.getGridData();
                this.uiService.showToastr('Success', 'Recommendation deleted successfully', 'success');
            },
            error: () => {
                this.uiService.showToastr('Error', 'Failed to delete recommendation', 'error');
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

        this._service.saveProductTag(input).subscribe({
            next: () => {
                this.drawer.close();
                this.getGridData();
                this.uiService.showToastr('Success', 'Recommendation saved successfully', 'success');
            },
            error: () => {
                this.uiService.showToastr('Error', 'System error occurred while saving recommendation', 'error');
            }
        });
    }

    onCancelClicked() {
        this.drawer.close();
    }
}
