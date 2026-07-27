import { Component, OnInit, ViewChild, ViewEncapsulation, TemplateRef } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map, startWith, forkJoin } from 'rxjs';

// Angular Material Modules
import { MatButtonModule } from '@angular/material/button';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';

// Fuse Components
import { FuseAlertComponent } from '@fuse/components/table-grid/table-grid.component';

// Services
import { EcommerceService } from '../ecommerce.service';
import { UiService } from '@services/ui.service';
import { DataImportExportComponent } from '../../shared/components/data-import-export/data-import-export.component';

@Component({
    selector: 'app-app-config',
    templateUrl: './app-config.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        MatButtonModule, FormsModule, ReactiveFormsModule,
        MatCardContent, MatCard, MatFormFieldModule,
        MatInputModule, MatSelectModule,
        MatIconModule, FuseAlertComponent,
        DataImportExportComponent, MatDialogModule, MatCheckboxModule,
        MatTooltipModule
    ]
})
export class AppConfigComponent implements OnInit {

    @ViewChild('missingConfigDialogTpl') missingConfigDialogTpl!: TemplateRef<any>;

    table: any = {
        gridData: [],
        loading: false
    };

    searchControl = new FormControl('');
    selectedGroupControl = new FormControl('ALL');
    
    filterValue = {
        searchValue: ''
    };

    allDefConfigs: any[] = [];
    missingConfigs: any[] = [];
    dbConfigs: any[] = [];
    configGroups: string[] = ['ALL'];

    // Dialog reference and selections
    private _dialogRef!: MatDialogRef<any>;
    selectedMissingConfigs: { [key: string]: boolean } = {};
    isAddingConfigs: boolean = false;

    constructor(
        private _service: EcommerceService,
        protected uiService: UiService,
        private _dialog: MatDialog
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
                this.filterGridData();
            });

        this.selectedGroupControl.valueChanges.subscribe(() => {
            this.filterGridData();
        });
    }

    ngOnInit(): void {
        this.loadDefinitionsAndData();
    }

    loadDefinitionsAndData() {
        this.table.loading = true;
        
        // Load definitions first
        this._service.getAppConfigDefinitions().subscribe({
            next: (defs: any[]) => {
                this.allDefConfigs = defs || [];
                this.getGridData();
            },
            error: () => {
                this.allDefConfigs = [];
                this.getGridData();
            }
        });
    }

    getGridData() {
        this.table.loading = true;
        this._service.getAppConfig().subscribe({
            next: (res: any[]) => {
                this.dbConfigs = (res || []).map(item => {
                    const def = this.allDefConfigs.find(d => d.configCode === item.configCode);
                    if (def) {
                        if (!item.controlType) {
                            item.controlType = def.controlType;
                        }
                        if (!item.configName) {
                            item.configName = def.configName;
                        }
                    }
                    return item;
                });
                
                // Extract unique groups
                const groups = this.dbConfigs.map(item => item.configGroup).filter(Boolean);
                this.configGroups = ['ALL', ...new Set(groups)];

                this.calculateMissingConfigs();
                this.filterGridData();
            },
            error: () => {
                this.dbConfigs = [];
                this.configGroups = ['ALL'];
                this.calculateMissingConfigs();
                this.filterGridData();
            }
        });
    }

    calculateMissingConfigs() {
        this.missingConfigs = this.allDefConfigs.filter(def => 
            !this.dbConfigs.some(ext => ext.configCode === def.configCode)
        );
    }

    filterGridData() {
        const search = this.filterValue.searchValue.toLowerCase();
        const selectedGroup = this.selectedGroupControl.value;

        this.table.gridData = this.dbConfigs.filter(item => {
            const matchesSearch = !search || 
                (item.configCode && item.configCode.toLowerCase().includes(search)) ||
                (item.configName && item.configName.toLowerCase().includes(search)) ||
                (item.configValue && item.configValue.toLowerCase().includes(search));
                
            const matchesGroup = !selectedGroup || selectedGroup === 'ALL' || item.configGroup === selectedGroup;
            
            return matchesSearch && matchesGroup;
        });
        
        this.table.loading = false;
    }

    saveInlineRow(row: any) {
        row.saving = true;
        this._service.saveAppConfig(row).subscribe({
            next: (res: any) => {
                row.saving = false;
                if (res && res.id) {
                    row.id = res.id;
                }
                this.uiService.showToastr('Success', 'Configuration saved successfully', 'success');
            },
            error: () => {
                row.saving = false;
                this.uiService.showToastr('Error', 'Failed to save configuration', 'error');
            }
        });
    }

    deleteInlineRow(row: any) {
        if (confirm('Are you sure you want to delete this configuration?')) {
            this.table.loading = true;
            this._service.deleteAppConfig(row.id).subscribe({
                next: () => {
                    this.getGridData();
                    this.uiService.showToastr('Success', 'Configuration deleted successfully', 'success');
                },
                error: () => {
                    this.table.loading = false;
                    this.uiService.showToastr('Error', 'Failed to delete configuration', 'error');
                }
            });
        }
    }

    // Missing Configs Dialog Handlers
    openMissingConfigsDialog() {
        this.selectedMissingConfigs = {};
        this.missingConfigs.forEach(config => {
            this.selectedMissingConfigs[config.configCode] = false;
        });
        this._dialogRef = this._dialog.open(this.missingConfigDialogTpl, {
            width: '650px',
            disableClose: true
        });
    }

    closeMissingConfigsDialog() {
        this._dialogRef.close();
    }

    toggleSelectAllMissing(checked: boolean) {
        this.missingConfigs.forEach(config => {
            this.selectedMissingConfigs[config.configCode] = checked;
        });
    }

    isAllMissingSelected(): boolean {
        return this.missingConfigs.length > 0 && 
            this.missingConfigs.every(config => this.selectedMissingConfigs[config.configCode]);
    }

    hasAnyMissingSelected(): boolean {
        return this.missingConfigs.some(config => this.selectedMissingConfigs[config.configCode]);
    }

    addSelectedConfigs() {
        const toAdd = this.missingConfigs.filter(config => this.selectedMissingConfigs[config.configCode]);
        if (toAdd.length === 0) return;

        this.isAddingConfigs = true;

        const observables = toAdd.map(config => {
            const payload = {
                configCode: config.configCode,
                configName: config.configName,
                configGroup: config.configGroup,
                controlType: config.controlType,
                configValue: config.defaultValue || '' // Set default value as the value
            };
            return this._service.saveAppConfig(payload);
        });

        forkJoin(observables).subscribe({
            next: () => {
                this.isAddingConfigs = false;
                this.closeMissingConfigsDialog();
                this.getGridData();
                this.uiService.showToastr('Success', `Successfully added ${toAdd.length} configuration(s)`, 'success');
            },
            error: (err) => {
                this.isAddingConfigs = false;
                console.error(err);
                this.uiService.showToastr('Error', 'Failed to add some configurations', 'error');
            }
        });
    }
}
