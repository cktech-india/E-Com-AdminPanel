import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';

// Fuse Components
import { FuseDrawerComponent } from '@fuse/components/drawer';
import { CkTable, FuseAlertComponent } from '@fuse/components/table-grid/table-grid.component';

// Services
import { EcommerceService } from '../ecommerce.service';
import { UiService } from '@services/ui.service';
import { DataImportExportComponent } from '../../shared/components/data-import-export/data-import-export.component';

@Component({
    selector: 'app-tax-config',
    templateUrl: './tax-config.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        MatButtonModule, FormsModule, ReactiveFormsModule,
        MatCardContent, MatCard, MatOptionModule, MatFormFieldModule,
        MatInputModule, MatSelectModule, MatSlideToggleModule, MatTabsModule,
        CommonModule, MatIconModule, FuseAlertComponent, FuseDrawerComponent,
        DataImportExportComponent
    ]
})
export class TaxConfigComponent implements OnInit {

    // Drawers
    @ViewChild('taxCategoryDrawer') taxCategoryDrawer!: FuseDrawerComponent;
    @ViewChild('taxRateDrawer') taxRateDrawer!: FuseDrawerComponent;
    @ViewChild('hsnDrawer') hsnDrawer!: FuseDrawerComponent;
    @ViewChild('shippingDrawer') shippingDrawer!: FuseDrawerComponent;
    @ViewChild('stateDrawer') stateDrawer!: FuseDrawerComponent;
    @ViewChild('countryDrawer') countryDrawer!: FuseDrawerComponent;

    // Forms
    taxCategoryForm!: FormGroup;
    taxRateForm!: FormGroup;
    hsnForm!: FormGroup;
    shippingForm!: FormGroup;
    stateForm!: FormGroup;
    countryForm!: FormGroup;

    // Tables
    taxCategoryTable!: CkTable;
    taxRateTable!: CkTable;
    hsnTable!: CkTable;
    shippingTable!: CkTable;
    stateTable!: CkTable;
    countryTable!: CkTable;

    // Active configuration state
    recordMode: string = 'C';
    activeTab: number = 0;

    // Data lists
    taxCategories: any[] = [];
    states: any[] = [];

    constructor(
        private _service: EcommerceService,
        protected uiService: UiService
    ) {}

    ngOnInit(): void {
        this.initializeForms();
        this.initializeTables();
        this.loadTaxCategories();
        this.loadStates();
        this.loadTabData();
    }

    initializeForms() {
        this.taxCategoryForm = new FormGroup({
            id: new FormControl(null),
            name: new FormControl(null, Validators.required),
            description: new FormControl(''),
            isActive: new FormControl(true)
        });

        this.taxRateForm = new FormGroup({
            id: new FormControl(null),
            taxName: new FormControl(null, Validators.required),
            taxPercentage: new FormControl(0, [Validators.required, Validators.min(0)]),
            countryCode: new FormControl('IN', Validators.required),
            stateCode: new FormControl(null),
            taxCategoryId: new FormControl(null, Validators.required),
            isActive: new FormControl(true)
        });

        this.hsnForm = new FormGroup({
            id: new FormControl(null),
            hsnCode: new FormControl(null, Validators.required),
            description: new FormControl(''),
            gstRate: new FormControl(0, [Validators.required, Validators.min(0)]),
            cgstRate: new FormControl(0, [Validators.required, Validators.min(0)]),
            sgstRate: new FormControl(0, [Validators.required, Validators.min(0)]),
            igstRate: new FormControl(0, [Validators.required, Validators.min(0)]),
            cessRate: new FormControl(0),
            taxCategoryId: new FormControl(null),
            isActive: new FormControl(true)
        });

        this.shippingForm = new FormGroup({
            id: new FormControl(null),
            size: new FormControl(null, Validators.required),
            sameStateCharge: new FormControl(0, [Validators.required, Validators.min(0)]),
            otherStateCharge: new FormControl(0, [Validators.required, Validators.min(0)]),
            isActive: new FormControl(true)
        });

        this.stateForm = new FormGroup({
            id: new FormControl(null),
            stateName: new FormControl(null, Validators.required),
            stateCode: new FormControl(null, Validators.required),
            isActive: new FormControl(true)
        });

        this.countryForm = new FormGroup({
            id: new FormControl(null),
            countryName: new FormControl(null, Validators.required),
            countryId: new FormControl(null, Validators.required),
            isActive: new FormControl(true)
        });
    }

    initializeTables() {
        // Tax Category Table
        this.taxCategoryTable = {
            gridData: [],
            columns: [
                { header: 'ID', column: 'id', width: '80px' },
                { header: 'Name', column: 'name' },
                { header: 'Description', column: 'description' },
                { header: 'Active', column: 'isActive', formatter: (v) => v ? 'Yes' : 'No' }
            ],
            actions: [
                { label: 'Edit', icon: 'edit', action: (row) => this.editTaxCategory(row) },
                { label: 'Delete', icon: 'delete', confirm: true, action: (row) => this.deleteTaxCategory(row) }
            ],
            loading: false
        };

        // Tax Rate Table
        this.taxRateTable = {
            gridData: [],
            columns: [
                { header: 'Tax Name', column: 'taxName' },
                { header: 'Rate (%)', column: 'taxPercentage', formatter: (v) => `${v}%` },
                { header: 'State Code', column: 'stateCode' },
                { 
                    header: 'Tax Category', 
                    column: 'taxCategoryId', 
                    formatter: (v) => this.getTaxCategoryName(v)
                },
                { header: 'Active', column: 'isActive', formatter: (v) => v ? 'Yes' : 'No' }
            ],
            actions: [
                { label: 'Edit', icon: 'edit', action: (row) => this.editTaxRate(row) },
                { label: 'Delete', icon: 'delete', confirm: true, action: (row) => this.deleteTaxRate(row) }
            ],
            loading: false
        };

        // HSN Table
        this.hsnTable = {
            gridData: [],
            columns: [
                { header: 'HSN Code', column: 'hsnCode' },
                { header: 'Description', column: 'description' },
                { header: 'GST (%)', column: 'gstRate', formatter: (v) => `${v}%` },
                { header: 'CGST (%)', column: 'cgstRate', formatter: (v) => `${v}%` },
                { header: 'SGST (%)', column: 'sgstRate', formatter: (v) => `${v}%` },
                { header: 'IGST (%)', column: 'igstRate', formatter: (v) => `${v}%` }
            ],
            actions: [
                { label: 'Edit', icon: 'edit', action: (row) => this.editHsn(row) },
                { label: 'Delete', icon: 'delete', confirm: true, action: (row) => this.deleteHsn(row) }
            ],
            loading: false
        };

        // Shipping Charges Table
        this.shippingTable = {
            gridData: [],
            columns: [
                { header: 'Size', column: 'size' },
                { header: 'Same State (₹)', column: 'sameStateCharge', formatter: (v) => `₹${Number(v).toFixed(2)}` },
                { header: 'Other State (₹)', column: 'otherStateCharge', formatter: (v) => `₹${Number(v).toFixed(2)}` },
                { header: 'Active', column: 'isActive', formatter: (v) => v ? 'Yes' : 'No' }
            ],
            actions: [
                { label: 'Edit', icon: 'edit', action: (row) => this.editShipping(row) },
                { label: 'Delete', icon: 'delete', confirm: true, action: (row) => this.deleteShipping(row) }
            ],
            loading: false
        };

        // States Table
        this.stateTable = {
            gridData: [],
            columns: [
                { header: 'State Name', column: 'stateName' },
                { header: 'State Code', column: 'stateCode' },
                { header: 'Active', column: 'isActive', formatter: (v) => v ? 'Yes' : 'No' }
            ],
            actions: [
                { label: 'Edit', icon: 'edit', action: (row) => this.editState(row) },
                { label: 'Delete', icon: 'delete', confirm: true, action: (row) => this.deleteState(row) }
            ],
            loading: false
        };

        // Countries Table
        this.countryTable = {
            gridData: [],
            columns: [
                { header: 'Country ID / Code', column: 'countryId' },
                { header: 'Country Name', column: 'countryName' },
                { header: 'Active', column: 'isActive', formatter: (v) => v ? 'Yes' : 'No' }
            ],
            actions: [
                { label: 'Edit', icon: 'edit', action: (row) => this.editCountry(row) },
                { label: 'Delete', icon: 'delete', confirm: true, action: (row) => this.deleteCountry(row) }
            ],
            loading: false
        };
    }

    loadTaxCategories() {
        this._service.getTaxCategories().subscribe({
            next: (res) => {
                this.taxCategories = res || [];
                this.taxRateTable = { ...this.taxRateTable };
            }
        });
    }

    loadStates() {
        this._service.getStates().subscribe({
            next: (res) => {
                this.states = res || [];
            }
        });
    }

    getTaxCategoryName(id: number): string {
        const cat = this.taxCategories.find(c => c.id === id);
        return cat ? cat.name : `ID: ${id}`;
    }

    onTabChanged(index: number) {
        this.activeTab = index;
        this.loadTabData();
    }

    loadTabData() {
        if (this.activeTab === 0) {
            this.taxCategoryTable.loading = true;
            this.taxCategoryTable = { ...this.taxCategoryTable };
            this._service.getTaxCategories().subscribe(res => {
                this.taxCategoryTable.gridData = res || [];
                this.taxCategoryTable.loading = false;
                this.taxCategoryTable = { ...this.taxCategoryTable };
            });
        } else if (this.activeTab === 1) {
            this.taxRateTable.loading = true;
            this.taxRateTable = { ...this.taxRateTable };
            this._service.getTaxRates().subscribe(res => {
                this.taxRateTable.gridData = res || [];
                this.taxRateTable.loading = false;
                this.taxRateTable = { ...this.taxRateTable };
            });
        } else if (this.activeTab === 2) {
            this.hsnTable.loading = true;
            this.hsnTable = { ...this.hsnTable };
            this._service.getGstHsnCodes().subscribe(res => {
                this.hsnTable.gridData = res || [];
                this.hsnTable.loading = false;
                this.hsnTable = { ...this.hsnTable };
            });
        } else if (this.activeTab === 3) {
            this.shippingTable.loading = true;
            this.shippingTable = { ...this.shippingTable };
            this._service.getShippingCharges().subscribe(res => {
                this.shippingTable.gridData = res || [];
                this.shippingTable.loading = false;
                this.shippingTable = { ...this.shippingTable };
            });
        } else if (this.activeTab === 4) {
            this.stateTable.loading = true;
            this.stateTable = { ...this.stateTable };
            this._service.getStates().subscribe(res => {
                this.stateTable.gridData = res || [];
                this.stateTable.loading = false;
                this.stateTable = { ...this.stateTable };
            });
        } else if (this.activeTab === 5) {
            this.countryTable.loading = true;
            this.countryTable = { ...this.countryTable };
            this._service.getCountries().subscribe(res => {
                this.countryTable.gridData = res || [];
                this.countryTable.loading = false;
                this.countryTable = { ...this.countryTable };
            });
        }
    }

    // ================= ADD / EDIT / DELETE ACTIONS =================

    newCategoryClicked() {
        this.recordMode = 'C';
        this.taxCategoryForm.reset({ isActive: true });
        this.taxCategoryDrawer.open();
    }
    editTaxCategory(row: any) {
        this.recordMode = 'E';
        this.taxCategoryForm.patchValue(row);
        this.taxCategoryDrawer.open();
    }
    deleteTaxCategory(row: any) {
        this._service.deleteTaxCategory(row.id).subscribe(() => {
            this.loadTabData();
            this.loadTaxCategories();
            this.uiService.showToastr('Success', 'Tax Category deleted', 'success');
        });
    }
    saveTaxCategory() {
        if (this.taxCategoryForm.invalid) return;
        const input = this.taxCategoryForm.getRawValue();
        input.recordMode = this.recordMode;
        this._service.saveTaxCategory(input).subscribe(() => {
            this.taxCategoryDrawer.close();
            this.loadTabData();
            this.loadTaxCategories();
            this.uiService.showToastr('Success', 'Tax Category saved', 'success');
        });
    }

    newRateClicked() {
        this.recordMode = 'C';
        this.taxRateForm.reset({ countryCode: 'IN', isActive: true });
        this.taxRateDrawer.open();
    }
    editTaxRate(row: any) {
        this.recordMode = 'E';
        this.taxRateForm.patchValue(row);
        this.taxRateDrawer.open();
    }
    deleteTaxRate(row: any) {
        this._service.deleteTaxRate(row.id).subscribe(() => {
            this.loadTabData();
            this.uiService.showToastr('Success', 'Tax Rate deleted', 'success');
        });
    }
    saveTaxRate() {
        if (this.taxRateForm.invalid) return;
        const input = this.taxRateForm.getRawValue();
        input.recordMode = this.recordMode;
        this._service.saveTaxRate(input).subscribe(() => {
            this.taxRateDrawer.close();
            this.loadTabData();
            this.uiService.showToastr('Success', 'Tax Rate saved', 'success');
        });
    }

    newHsnClicked() {
        this.recordMode = 'C';
        this.hsnForm.reset({ isActive: true });
        this.hsnDrawer.open();
    }
    editHsn(row: any) {
        this.recordMode = 'E';
        this.hsnForm.patchValue(row);
        this.hsnDrawer.open();
    }
    deleteHsn(row: any) {
        this._service.deleteGstHsnCode(row.id).subscribe(() => {
            this.loadTabData();
            this.uiService.showToastr('Success', 'HSN Code deleted', 'success');
        });
    }
    saveHsn() {
        if (this.hsnForm.invalid) return;
        const input = this.hsnForm.getRawValue();
        input.recordMode = this.recordMode;
        this._service.saveGstHsnCode(input).subscribe(() => {
            this.hsnDrawer.close();
            this.loadTabData();
            this.uiService.showToastr('Success', 'HSN Code saved', 'success');
        });
    }

    newShippingClicked() {
        this.recordMode = 'C';
        this.shippingForm.reset({ isActive: true });
        this.shippingDrawer.open();
    }
    editShipping(row: any) {
        this.recordMode = 'E';
        this.shippingForm.patchValue(row);
        this.shippingDrawer.open();
    }
    deleteShipping(row: any) {
        this._service.deleteShippingCharge(row.id).subscribe(() => {
            this.loadTabData();
            this.uiService.showToastr('Success', 'Shipping rate deleted', 'success');
        });
    }
    saveShipping() {
        if (this.shippingForm.invalid) return;
        const input = this.shippingForm.getRawValue();
        input.recordMode = this.recordMode;
        this._service.saveShippingCharge(input).subscribe(() => {
            this.shippingDrawer.close();
            this.loadTabData();
            this.uiService.showToastr('Success', 'Shipping rate saved', 'success');
        });
    }

    newStateClicked() {
        this.recordMode = 'C';
        this.stateForm.reset({ isActive: true });
        this.stateDrawer.open();
    }
    editState(row: any) {
        this.recordMode = 'E';
        this.stateForm.patchValue(row);
        this.stateDrawer.open();
    }
    deleteState(row: any) {
        this._service.deleteState(row.id).subscribe(() => {
            this.loadTabData();
            this.loadStates();
            this.uiService.showToastr('Success', 'State deleted', 'success');
        });
    }
    saveState() {
        if (this.stateForm.invalid) return;
        const input = this.stateForm.getRawValue();
        input.recordMode = this.recordMode;
        this._service.saveState(input).subscribe(() => {
            this.stateDrawer.close();
            this.loadTabData();
            this.loadStates();
            this.uiService.showToastr('Success', 'State saved', 'success');
        });
    }

    newCountryClicked() {
        this.recordMode = 'C';
        this.countryForm.reset({ isActive: true });
        this.countryDrawer.open();
    }
    editCountry(row: any) {
        this.recordMode = 'E';
        this.countryForm.patchValue(row);
        this.countryDrawer.open();
    }
    deleteCountry(row: any) {
        this._service.deleteCountry(row.id).subscribe(() => {
            this.loadTabData();
            this.uiService.showToastr('Success', 'Country deleted', 'success');
        });
    }
    saveCountry() {
        if (this.countryForm.invalid) return;
        const input = this.countryForm.getRawValue();
        input.recordMode = this.recordMode;
        this._service.saveCountry(input).subscribe(() => {
            this.countryDrawer.close();
            this.loadTabData();
            this.uiService.showToastr('Success', 'Country saved', 'success');
        });
    }
}
