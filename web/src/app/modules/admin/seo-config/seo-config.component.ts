import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs';

// Angular Material Modules
import { MatButtonModule } from '@angular/material/button';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

// Fuse Components
import { FuseDrawerComponent } from '@fuse/components/drawer';
import { CkTable, FuseAlertComponent } from '@fuse/components/table-grid/table-grid.component';

// Services
import { EcommerceService } from '../ecommerce.service';
import { UiService } from '@services/ui.service';
import { DataImportExportComponent } from '../../shared/components/data-import-export/data-import-export.component';

@Component({
    selector: 'app-seo-config',
    templateUrl: './seo-config.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        MatButtonModule, FormsModule, ReactiveFormsModule,
        MatCardContent, MatCard, MatFormFieldModule,
        MatInputModule, MatSelectModule,
        MatIconModule, FuseAlertComponent, FuseDrawerComponent,
        DataImportExportComponent
    ]
})
export class SeoConfigComponent implements OnInit {

    @ViewChild('seoFormTpl') drawer!: FuseDrawerComponent;

    inputForm!: FormGroup;
    table!: CkTable;
    recordMode: string = 'C';

    searchControl = new FormControl('');
    filterValue = {
        searchValue: ''
    };

    targetTypes = [
        { label: 'Link (e.g. about-us.php)', value: 'LINK' },
        { label: 'Product (ID)', value: 'PRODUCT' },
        { label: 'Menu Item', value: 'MENU' }
    ];

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
        this.getGridData();
    }

    initializeForm() {
        this.inputForm = new FormGroup({
            id: new FormControl(null),
            targetType: new FormControl('LINK', Validators.required),
            targetValue: new FormControl('', Validators.required),
            metaTitle: new FormControl('', Validators.required),
            metaDescription: new FormControl(''),
            metaKeywords: new FormControl(''),
            ogTitle: new FormControl(''),
            ogDescription: new FormControl(''),
            ogImageUrl: new FormControl('')
        });

        this.table = {
            gridData: [],
            columns: [
                { header: 'Target Type', column: 'targetType', width: '120px' },
                { header: 'Target Value', column: 'targetValue', width: '150px' },
                { header: 'Meta Title', column: 'metaTitle' },
                { header: 'Meta Description', column: 'metaDescription' }
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
                    confirmTitle: 'Delete SEO Entry',
                    confirmMessage: 'Are you sure you want to delete this SEO configuration entry?',
                    action: (row) => this.deleteRow(row)
                }
            ],
            isShowFilter: true,
            loading: false
        };
    }

    getGridData() {
        this.table.loading = true;
        this.table = { ...this.table };
        this._service.getSeoMetadata().subscribe({
            next: (res: any[]) => {
                const search = this.filterValue.searchValue.toLowerCase();
                this.table.gridData = (res || []).filter(item => 
                    !search || 
                    (item.targetValue && item.targetValue.toLowerCase().includes(search)) ||
                    (item.metaTitle && item.metaTitle.toLowerCase().includes(search)) ||
                    (item.metaDescription && item.metaDescription.toLowerCase().includes(search))
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
            id: null,
            targetType: 'LINK',
            targetValue: '',
            metaTitle: '',
            metaDescription: '',
            metaKeywords: '',
            ogTitle: '',
            ogDescription: '',
            ogImageUrl: ''
        });
        this.drawer.open();
    }

    editRow(row: any) {
        this.recordMode = 'E';
        this.inputForm.patchValue(row);
        this.drawer.open();
    }

    deleteRow(row: any) {
        this._service.deleteSeoMetadata(row.id).subscribe({
            next: () => {
                this.getGridData();
                this.uiService.showToastr('Success', 'SEO configuration entry deleted successfully', 'success');
            },
            error: () => {
                this.uiService.showToastr('Error', 'Failed to delete SEO configuration entry', 'error');
            }
        });
    }

    onSubmitClicked() {
        if (!this.inputForm.valid) {
            this.uiService.showToastr('Error', 'Please fill in all required fields', 'error');
            return;
        }

        const payload = this.inputForm.value;
        this._service.saveSeoMetadata(payload).subscribe({
            next: () => {
                this.getGridData();
                this.drawer.close();
                this.uiService.showToastr('Success', 'SEO configuration entry saved successfully', 'success');
            },
            error: () => {
                this.uiService.showToastr('Error', 'Failed to save SEO configuration entry', 'error');
            }
        });
    }

    onCancelClicked() {
        this.drawer.close();
    }
}
