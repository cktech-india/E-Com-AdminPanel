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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';

// Fuse Components
import { FuseDrawerComponent } from '@fuse/components/drawer';
import { CkTable, FuseAlertComponent } from '@fuse/components/table-grid/table-grid.component';

// Services
import { EcommerceService } from '../ecommerce.service';
import { UiService } from '@services/ui.service';
import { QuillModule } from 'ngx-quill';

@Component({
    selector: 'app-products',
    templateUrl: './products.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        MatButtonModule, FormsModule, ReactiveFormsModule,
        MatCardContent, MatCard, MatOptionModule, MatFormFieldModule,
        MatInputModule, MatSelectModule, MatSlideToggleModule, MatCheckboxModule,
        MatIconModule, FuseAlertComponent, FuseDrawerComponent, QuillModule
    ]
})
export class ProductsComponent implements OnInit {

    @ViewChild('productFormTpl') drawer!: FuseDrawerComponent;

    inputForm!: FormGroup;
    table!: CkTable;
    recordMode: string = 'C';

    searchControl = new FormControl('');
    filterValue = {
        searchValue: ''
    };

    categories: any[] = [];
    taxCategories: any[] = [];
    isLoading: boolean = false;

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
        this.loadDropdowns();
        this.getGridData();
    }

    initializeForm() {
        this.inputForm = new FormGroup({
            id: new FormControl(null),
            productCode: new FormControl(null, Validators.required),
            productName: new FormControl(null, Validators.required),
            categoryId: new FormControl(null, Validators.required),
            price: new FormControl(0, [Validators.required, Validators.min(0)]),
            availableQuantity: new FormControl(0, [Validators.required, Validators.min(0)]),
            discountPercentage: new FormControl(0, [Validators.min(0), Validators.max(100)]),
            productType: new FormControl('STANDARD'),
            description: new FormControl(''),
            imageUrl: new FormControl(''),
            hsnCode: new FormControl(''),
            isTaxInclusive: new FormControl(true),
            taxCategoryId: new FormControl(null),
            isActive: new FormControl(true)
        });

        this.table = {
            gridData: [],
            columns: [
                { header: 'Code', column: 'productCode' },
                { header: 'Product Name', column: 'productName' },
                { 
                    header: 'Category', 
                    column: 'categoryId',
                    formatter: (v) => {
                        const cat = this.categories.find(c => c.categoryId === v);
                        return cat ? cat.categoryName : v;
                    }
                },
                { 
                    header: 'Price', 
                    column: 'price',
                    formatter: (v) => `₹${Number(v).toFixed(2)}`
                },
                { header: 'Qty', column: 'availableQuantity' },
                { 
                    header: 'Active', 
                    column: 'isActive',
                    formatter: (v) => v ? 'Yes' : 'No'
                }
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
                    confirmTitle: 'Delete Product',
                    confirmMessage: 'Are you sure you want to delete this product?',
                    action: (row) => this.deleteRow(row)
                }
            ],
            isShowFilter: true,
            loading: false
        };
    }

    loadDropdowns() {
        this._service.getActiveCategories().subscribe({
            next: (res) => {
                this.categories = res || [];
                this.table = { ...this.table };
            }
        });

        this._service.getTaxCategories().subscribe({
            next: (res) => {
                this.taxCategories = res || [];
            }
        });
    }

    getGridData() {
        this.table.loading = true;
        this.table = { ...this.table };
        this._service.getProducts().subscribe({
            next: (res: any[]) => {
                const search = this.filterValue.searchValue.toLowerCase();
                this.table.gridData = (res || []).filter(item => 
                    !search || 
                    (item.productName && item.productName.toLowerCase().includes(search)) ||
                    (item.productCode && item.productCode.toLowerCase().includes(search))
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

    newRowClicked() {
        this.recordMode = 'C';
        this.inputForm.reset({
            price: 0,
            availableQuantity: 0,
            discountPercentage: 0,
            productType: 'STANDARD',
            isTaxInclusive: true,
            isActive: true
        });
        this.drawer.open();
    }

    editRow(row: any) {
        this.recordMode = 'E';
        this.inputForm.patchValue(row);
        this.drawer.open();
    }

    deleteRow(row: any) {
        this._service.deleteProduct(row.id).subscribe({
            next: () => {
                this.getGridData();
                this.uiService.showToastr('Success', 'Product deleted successfully', 'success');
            },
            error: () => {
                this.uiService.showToastr('Error', 'Failed to delete product', 'error');
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

        this._service.saveProduct(input).subscribe({
            next: (res: any) => {
                this.drawer.close();
                this.getGridData();
                this.uiService.showToastr('Success', 'Product saved successfully', 'success');
            },
            error: () => {
                this.uiService.showToastr('Error', 'System error occurred while saving product', 'error');
            }
        });
    }

    exportToCSV() {
        const data = this.table.gridData;
        if (!data || !data.length) {
            this.uiService.showToastr('Warning', 'No data to export', 'warning');
            return;
        }
        const headers = ['Product Code', 'Product Name', 'Price', 'Available Quantity', 'Active'];
        const csvRows = [headers.join(',')];
        for (const row of data) {
            const values = [
                `"${row.productCode || ''}"`,
                `"${row.productName || ''}"`,
                row.price || 0,
                row.availableQuantity || 0,
                row.isActive ? 'Yes' : 'No'
            ];
            csvRows.push(values.join(','));
        }
        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'products_list.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    onCancelClicked() {
        this.drawer.close();
    }
}
