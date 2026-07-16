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
import { EcommerceService } from '../ecommerce.service';
import { UiService } from '@services/ui.service';

@Component({
    selector: 'app-home-config',
    templateUrl: './home-config.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        MatButtonModule, FormsModule, ReactiveFormsModule,
        MatCardContent, MatCard, MatOptionModule, MatFormFieldModule,
        MatInputModule, MatSelectModule,
        MatIconModule, FuseAlertComponent, FuseDrawerComponent
    ]
})
export class HomeConfigComponent implements OnInit {

    @ViewChild('configFormTpl') drawer!: FuseDrawerComponent;

    inputForm!: FormGroup;
    table!: CkTable;
    recordMode: string = 'C';

    searchControl = new FormControl('');
    filterValue = {
        searchValue: ''
    };

    readonly CONFIG_TYPES = [
        'HERO_SECTION',
        'CATEGORY',
        'TESTIMONIAL',
        'PRODUCT_TAGS',
        'CATEGORY_WITH_PRODUCT',
        'CONTACT_US',
        'ABOUT_US'
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
            configType: new FormControl(null, Validators.required),
            configTitle: new FormControl(''),
            configValue: new FormControl(''),
            configProperties: new FormControl(''),
            sequenceNo: new FormControl(1, [Validators.required, Validators.min(1)])
        });

        this.table = {
            gridData: [],
            columns: [
                { header: 'Sequence', column: 'sequenceNo' },
                { header: 'Config Type', column: 'configType' },
                { header: 'Title', column: 'configTitle' },
                { header: 'Value', column: 'configValue' },
                { header: 'Properties', column: 'configProperties' }
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
                    confirmTitle: 'Delete Home Config',
                    confirmMessage: 'Are you sure you want to delete this home screen configuration?',
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
        this._service.getHomeConfigs().subscribe({
            next: (res: any[]) => {
                const search = this.filterValue.searchValue.toLowerCase();
                const filtered = (res || []).filter(item => 
                    !search || 
                    (item.configType && item.configType.toLowerCase().includes(search)) ||
                    (item.configTitle && item.configTitle.toLowerCase().includes(search)) ||
                    (item.configValue && item.configValue.toLowerCase().includes(search))
                );
                // Sort by sequenceNo
                this.table.gridData = filtered.sort((a, b) => (a.sequenceNo || 0) - (b.sequenceNo || 0));
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
            sequenceNo: 1
        });
        this.drawer.open();
    }

    editRow(row: any) {
        this.recordMode = 'E';
        this.inputForm.patchValue(row);
        this.drawer.open();
    }

    deleteRow(row: any) {
        this._service.deleteHomeConfig(row.id).subscribe({
            next: () => {
                this.getGridData();
                this.uiService.showToastr('Success', 'Home configuration deleted successfully', 'success');
            },
            error: () => {
                this.uiService.showToastr('Error', 'Failed to delete configuration', 'error');
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

        this._service.saveHomeConfig(input).subscribe({
            next: () => {
                this.drawer.close();
                this.getGridData();
                this.uiService.showToastr('Success', 'Home configuration saved successfully', 'success');
            },
            error: () => {
                this.uiService.showToastr('Error', 'System error occurred while saving home configuration', 'error');
            }
        });
    }

    onCancelClicked() {
        this.drawer.close();
    }
}
