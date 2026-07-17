import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs';

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
import { EcommerceService } from '../ecommerce.service';
import { UiService } from '@services/ui.service';
import { DataImportExportComponent } from '../../shared/components/data-import-export/data-import-export.component';

@Component({
    selector: 'app-faqs',
    templateUrl: './faqs.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        MatButtonModule, FormsModule, ReactiveFormsModule,
        MatCardContent, MatCard, MatFormFieldModule,
        MatInputModule,
        MatIconModule, FuseAlertComponent, FuseDrawerComponent,
        DataImportExportComponent
    ]
})
export class FaqsComponent implements OnInit {

    @ViewChild('faqFormTpl') drawer!: FuseDrawerComponent;

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
            faqId: new FormControl(null),
            faqQns: new FormControl(null, Validators.required),
            faqAnswer: new FormControl(null, Validators.required)
        });

        this.table = {
            gridData: [],
            columns: [
                { header: 'ID', column: 'faqId', width: '80px' },
                { header: 'Question', column: 'faqQns' },
                { header: 'Answer', column: 'faqAnswer' }
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
                    confirmTitle: 'Delete FAQ',
                    confirmMessage: 'Are you sure you want to delete this FAQ?',
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
        this._service.getFaqs().subscribe({
            next: (res: any[]) => {
                const search = this.filterValue.searchValue.toLowerCase();
                this.table.gridData = (res || []).filter(item => 
                    !search || 
                    (item.faqQns && item.faqQns.toLowerCase().includes(search)) ||
                    (item.faqAnswer && item.faqAnswer.toLowerCase().includes(search))
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
        this.inputForm.reset();
        this.drawer.open();
    }

    editRow(row: any) {
        this.recordMode = 'E';
        this.inputForm.patchValue(row);
        this.drawer.open();
    }

    deleteRow(row: any) {
        this._service.deleteFaq(row.faqId).subscribe({
            next: () => {
                this.getGridData();
                this.uiService.showToastr('Success', 'FAQ deleted successfully', 'success');
            },
            error: () => {
                this.uiService.showToastr('Error', 'Failed to delete FAQ', 'error');
            }
        });
    }

    onSubmitClicked() {
        if (!this.inputForm.valid) {
            this.uiService.showToastr('Error', 'Please enter a question and answer', 'error');
            return;
        }

        const input = this.inputForm.getRawValue();
        input.recordMode = this.recordMode;

        this._service.saveFaq(input).subscribe({
            next: () => {
                this.drawer.close();
                this.getGridData();
                this.uiService.showToastr('Success', 'FAQ saved successfully', 'success');
            },
            error: () => {
                this.uiService.showToastr('Error', 'Failed to save FAQ', 'error');
            }
        });
    }

    onCancelClicked() {
        this.drawer.close();
    }
}
