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

// Fuse Components
import { FuseDrawerComponent } from '@fuse/components/drawer';
import { CkTable, FuseAlertComponent } from '@fuse/components/table-grid/table-grid.component';

// Services
import { EcommerceService } from '../../ecommerce.service';
import { UiService } from '@services/ui.service';

@Component({
    selector: 'app-product-reviews',
    templateUrl: './product-reviews.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        MatButtonModule, FormsModule, ReactiveFormsModule,
        MatCardContent, MatCard, MatOptionModule, MatFormFieldModule,
        MatInputModule, MatSelectModule, MatSlideToggleModule,
        MatIconModule, FuseAlertComponent, FuseDrawerComponent
    ]
})
export class ProductReviewsComponent implements OnInit {

    @ViewChild('reviewFormTpl') drawer!: FuseDrawerComponent;

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
            reviewerName: new FormControl('', Validators.required),
            reviewText: new FormControl(''),
            rating: new FormControl(5, [Validators.required, Validators.min(1), Validators.max(5)]),
            reviewDate: new FormControl(new Date().toISOString()),
            isActive: new FormControl(true)
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
                        return prod ? prod.productName : v;
                    }
                },
                { header: 'Reviewer', column: 'reviewerName' },
                { header: 'Rating', column: 'rating', formatter: (v) => '⭐'.repeat(Number(v)) },
                { header: 'Review Text', column: 'reviewText' },
                { 
                    header: 'Approved / Active', 
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
                    confirmTitle: 'Delete Review',
                    confirmMessage: 'Are you sure you want to delete this review?',
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
        this._service.getProductReviews().subscribe({
            next: (res: any[]) => {
                const search = this.filterValue.searchValue.toLowerCase();
                this.table.gridData = (res || []).filter(item => {
                    const prod = this.products.find(p => p.id === item.productId);
                    const prodName = prod ? prod.productName.toLowerCase() : '';
                    return !search || 
                        (item.reviewerName && item.reviewerName.toLowerCase().includes(search)) ||
                        (item.reviewText && item.reviewText.toLowerCase().includes(search)) ||
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
            rating: 5,
            reviewDate: new Date().toISOString(),
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
        this._service.deleteProductReview(row.id).subscribe({
            next: () => {
                this.getGridData();
                this.uiService.showToastr('Success', 'Product Review deleted successfully', 'success');
            },
            error: () => {
                this.uiService.showToastr('Error', 'Failed to delete review', 'error');
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

        this._service.saveProductReview(input).subscribe({
            next: () => {
                this.drawer.close();
                this.getGridData();
                this.uiService.showToastr('Success', 'Product Review saved successfully', 'success');
            },
            error: () => {
                this.uiService.showToastr('Error', 'System error occurred while saving product review', 'error');
            }
        });
    }

    onCancelClicked() {
        this.drawer.close();
    }
}
