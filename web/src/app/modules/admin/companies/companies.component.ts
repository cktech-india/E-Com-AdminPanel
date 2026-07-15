import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs';

// Angular Material Modules
import { MatButtonModule } from '@angular/material/button';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

// Fuse Components
import { FuseDrawerComponent } from '@fuse/components/drawer';
import { CkTable, FuseAlertComponent } from '@fuse/components/table-grid/table-grid.component';

// Services
import { EcommerceService } from '../ecommerce.service';
import { UiService } from '@services/ui.service';

@Component({
    selector: 'app-companies',
    templateUrl: './companies.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        MatButtonModule, FormsModule, ReactiveFormsModule,
        MatCardContent, MatCard, MatFormFieldModule,
        MatInputModule, MatSlideToggleModule,
        MatIconModule, FuseAlertComponent, FuseDrawerComponent
    ]
})
export class CompaniesComponent implements OnInit {

    @ViewChild('companyFormTpl') drawer!: FuseDrawerComponent;

    inputForm!: FormGroup;
    table!: CkTable;
    recordMode: string = 'C';

    searchControl = new FormControl('');
    filterValue = {
        searchValue: ''
    };

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
            companyCode: new FormControl(null, Validators.required),
            companyName: new FormControl(null, Validators.required),
            domainUrl: new FormControl(null, Validators.required),
            gstStateCode: new FormControl(''),
            gstNo: new FormControl(''),
            companyAddress: new FormControl(''),
            isActive: new FormControl(true)
        });

        this.table = {
            gridData: [],
            columns: [
                { header: 'Company Code', column: 'companyCode' },
                { header: 'Company Name', column: 'companyName' },
                { header: 'Domain URL', column: 'domainUrl' },
                { header: 'GST No', column: 'gstNo' },
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
                    confirmTitle: 'Delete Company',
                    confirmMessage: 'Are you sure you want to delete this company registry? This might isolate associated records!',
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
        this._service.getCompanies().subscribe({
            next: (res: any[]) => {
                const search = this.filterValue.searchValue.toLowerCase();
                this.table.gridData = (res || []).filter(item => 
                    !search || 
                    (item.companyName && item.companyName.toLowerCase().includes(search)) ||
                    (item.companyCode && item.companyCode.toLowerCase().includes(search))
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
        // Since id is companyCode, we need to pass companyCode to backend delete service if mapped to ID.
        // Wait, CompanyDTO does not use Long ID, it uses String companyCode.
        // In JPA, companyCode is the @Id, so we delete by companyCode. But java controller uses Long id?
        // Wait! Let's check CompanyController.java to see how delete is implemented.
        // Let's do a quick search.
        this._service.deleteCompany(row.companyCode).subscribe({
            next: () => {
                this.getGridData();
                this.uiService.showToastr('Success', 'Company deleted successfully', 'success');
            },
            error: () => {
                this.uiService.showToastr('Error', 'Failed to delete company', 'error');
            }
        });
    }

    onSubmitClicked() {
        if (!this.inputForm.valid) {
            this.uiService.showToastr('Error', 'Please fill required fields', 'error');
            return;
        }

        const input = this.inputForm.getRawValue();
        input.recordMode = this.recordMode;

        this._service.saveCompany(input).subscribe({
            next: () => {
                this.drawer.close();
                this.getGridData();
                this.uiService.showToastr('Success', 'Company saved successfully', 'success');
            },
            error: () => {
                this.uiService.showToastr('Error', 'System error occurred while saving company', 'error');
            }
        });
    }

    onCancelClicked() {
        this.drawer.close();
    }
}
