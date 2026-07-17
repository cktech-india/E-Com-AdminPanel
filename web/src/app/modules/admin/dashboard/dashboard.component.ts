import { DatePipe, JsonPipe, NgTemplateOutlet, UpperCasePipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    Input,
    OnInit,
    Pipe,
    PipeTransform,
    TemplateRef,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import {
    MatExpansionPanel,
    MatExpansionPanelActionRow,
    MatExpansionPanelDescription,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
} from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltip } from '@angular/material/tooltip';
import { ActivatedRoute } from '@angular/router';
import { NgApexchartsModule } from 'ng-apexcharts';
import { CrudService } from '../../../crud-operation.service';
import { DataService } from '../../../data.service';
import { UiService } from '../../../ui.service';
import { ChartService, GridActionButtonModel, WidgetModel } from './chart.service';
import { ProgressWidgetComponent } from './progress-widget.component';
import { ScoreCardWidgetComponent } from './score-card-widget.component';
import { GridWidgetComponent } from './grid-widget.component';
import { ChartWidgetComponent } from './chart-widget.component';

// ---------------------------------------------------------------------------
// Utility pipe: extracts the 'field' property from each column definition
// so it can be passed to *matHeaderRowDef / *matRowDef
// ---------------------------------------------------------------------------
@Pipe({ name: 'columnFields', standalone: true })
export class ColumnFieldsPipe implements PipeTransform {
    transform(columns: any[]): string[] {
        if (!Array.isArray(columns)) return [];
        return columns.map((c) => c.field);
    }
}

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [
        // Angular
        FormsModule,
        NgTemplateOutlet,
        // Angular Material
        MatTabsModule,
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        MatDividerModule,
        MatTableModule,
        MatLabel,
        MatFormField,
        MatDatepickerToggle,
        MatDatepicker,
        MatSelect,
        MatOption,
        MatInput,
        MatDatepickerInput,
        MatTooltip,
        MatExpansionPanel,
        MatExpansionPanelDescription,
        MatExpansionPanelHeader,
        MatExpansionPanelTitle,
        MatMenuTrigger,
        MatMenuItem,
        MatMenu,
        MatExpansionPanelActionRow,
        MatPaginatorModule,
        // Charts
        NgApexchartsModule,
        // Local pipe
        ColumnFieldsPipe,
        ProgressWidgetComponent,
        UpperCasePipe,
        ScoreCardWidgetComponent,
        GridWidgetComponent,
        ChartWidgetComponent,
        JsonPipe,
    ],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss',
    encapsulation: ViewEncapsulation.None,
})
export class DashboardComponent implements OnInit {
    @ViewChild('TABLE') table: ElementRef;
    @ViewChild('actionButton') actionButtonRef: TemplateRef<any>;
    @ViewChild('filterDialog', { static: true }) filterDialogRef: TemplateRef<any>;

    selectedWidgetIndex = 0;
    dialogRef: any;

    widgetDropDown: any[] = [];
    selectedWidget = null;
    selectedWidgetCode: string;

    /** Background colour classes for STATUS_COUNT widgets */
    statusCountClasses: string[] = [
        'bg-blue-700',
        'bg-teal-500',
        'bg-orange-600',
        'bg-purple-400',
        'bg-indigo-500',
        'bg-green-500',
        'bg-sky-500',
        'bg-purple-500',
        'bg-pink-500',
        'bg-orange-500',
        'bg-yellow-500',
        'bg-red-500',
    ];

    @Input() reportId? = 'HOME';
    @Input() defaultInput? = {};

    constructor(
        private activeRoute: ActivatedRoute,
        private http: HttpClient,
        private datePipe: DatePipe,
        public cdr: ChangeDetectorRef,
        public dialog: MatDialog,
        public _data: DataService,
        public _ui: UiService,
        protected _chart: ChartService,
        private _crud: CrudService
    ) { }

    // -----------------------------------------------------------------------
    // Lifecycle
    // -----------------------------------------------------------------------

    ngOnInit() {

        this.activeRoute.params.subscribe((params) => {
            this._data.dashboardInfo = {};
            this.widgetDropDown = [];
            this.reportId = params['reportId'] || this.reportId || 'HOME';
            this.getDashboardDetails();
        });
    }

    // -----------------------------------------------------------------------
    // Dashboard loading
    // -----------------------------------------------------------------------

    getDashboardDetails() {
        this.http.get(sessionStorage.getItem('apiUrl') + 'report/id/' + this.reportId).subscribe((e: any) => {
            this._data.dashboardInfo = e;
            this._data.globalFilter = [];

            if (this._data.dashboardInfo.reportType === 'REPORT') {
                this._data.dashboardInfo.reportWidgets.forEach((item: any) => {
                    this.widgetDropDown.push(item);
                });
                this._data.dashboardInfo.reportWidgets = [this._data.dashboardInfo.reportWidgets[0]];
            }
            this._data.globalFilter = this._data.dashboardInfo.filterColumns;
            this._data.globalFilterValues = {};
            this._data.globalFilter.forEach((filter: any) => {
                this._data.globalFilterValues[filter.code] = filter.defaultValue || '';
            });
            this.resetGlobalFilterControls();
            this._data.dashboardInfo.reportWidgets.forEach((widget: any) => {
                this.initWidget(widget);
            });
        });
    }
    refreshDashboard() {
        this._data.dashboardInfo.reportWidgets.forEach((widget: any) => {
            this.getWidgetData(widget);
        });
    }
    // -----------------------------------------------------------------------
    // Widget initialisation
    // -----------------------------------------------------------------------

    initWidget(widget: any) {
        try {
            if (!Array.isArray(widget.filterColumns)) {
                widget.filterColumns = JSON.parse(widget.filterColumns);
            }
            // widget.filterColumns.forEach((filter: any) => {
            //     if (!this._data.globalFilter.find((f: any) => f.code === filter.code)) {
            //         this._data.globalFilter.push({ ...filter });
            //     }
            // });
            if (!Array.isArray(widget.dataColumns)) {
                widget.dataColumns = JSON.parse(widget.dataColumns);
            }
            widget.inputs = { limit: 100, limitFrom: 0, ...this.defaultInput, ...this._data.globalFilterValues };
            this.resetWidgetFilterControls(widget);

            if (this._data.dashboardInfo.reportWidgets.length > 1) {
                this.getWidgetData(widget);
            } else {
                widget.inputs = { limit: 100, limitFrom: 0, ...this.defaultInput, ...this._data.globalFilterValues };
            }
        } catch (e) {
            console.error(e);
        }
    }

    resetWidgetFilterControls(widget: WidgetModel) {
        if (typeof widget.filterColumns === 'string') return;

        const dropdownFields: any[] = [];
        widget.filterColumns.forEach((item: any) => {
            if (item.control === 'DROPDOWN') {
                if (!Array.isArray(item.dropdownOptions)) {
                    dropdownFields.push(item);
                    item.dropdownOptions = [];
                }
            } else if (item.dataType === 'DATE' && !item.value) {
                item.value = new Date();
            } else if (!item.value) {
                item.value = item.defaultValue || '';
            }
            widget.inputs[item.code] = item.value;
        });
        dropdownFields.forEach((item) => this.loadDropdownValues(widget, item));
    }


    resetGlobalFilterControls() {
        if (typeof this._data.globalFilter === 'string') return;

        const dropdownFields: any[] = [];
        this._data.globalFilter.forEach((item: any) => {
            if (item.control === 'DROPDOWN') {
                if (!Array.isArray(item.dropdownOptions)) {
                    dropdownFields.push({
                        code: item.code,
                        dropdownOptions: item.dropdownOptions
                    });
                    item.dropdownOptions = [];
                }
            } else if (item.dataType === 'DATE' && !item.value) {
                item.value = new Date();
            } else if (!item.value) {
                item.value = item.defaultValue || '';
            }
            this._data.globalFilterValues[item.code] = item.value || '';
        });
        dropdownFields.forEach((item) => {
            this._crud
                .getDropdownValuesWithInput(item.dropdownOptions, {})
                .subscribe((res: any) => {
                    this._data.globalFilter.find((e: any) => e.code === item.code).dropdownOptions = res;
                });
        });
    }

    loadDropdownValues(widget: any, item: any) {
        this._crud
            .getDropdownValuesWithInput(item.processNameOrQuery, widget.inputs)
            .subscribe((res: any) => (item.dropdownOptions = res));
    }

    // -----------------------------------------------------------------------
    // Widget switching (REPORT type)
    // -----------------------------------------------------------------------

    onWidgetChanged() {
        this.selectedWidget = this.widgetDropDown.find((e) => e.widgetCode === this.selectedWidgetCode);
        this._data.dashboardInfo.reportWidgets = [this.selectedWidget];
        this.initWidget(this._data.dashboardInfo.reportWidgets[0]);
    }

    // -----------------------------------------------------------------------
    // Data fetching
    // -----------------------------------------------------------------------

    getWidgetData(widget: WidgetModel) {
        if (widget.widgetType === 'CHART' || widget.widgetType === 'PROGRESS') {
            this.getWidgetChartData(widget);
        } else if (widget.widgetType === 'GRID') {
            this.getWidgetGridData(widget, true);
        } else {
            this.getWidgetGridData(widget, false);
        }
    }

    getWidgetChartData(widget: WidgetModel) {
        const filters = { ...widget.inputs, ...this.defaultInput, ...this._data.globalFilterValues };
        delete filters.limit;
        delete filters.limitFrom;
        widget.isLoading = true;
        widget.exportAs = '';
        widget.inputs = filters;
        this.http.post(sessionStorage.getItem('apiUrl') + 'report/widget-data', widget).subscribe({
            next: (e: any) => {
                widget.data = e.data ?? [];
                if (widget.data.length === 0) {
                    this._ui.infoAlert('No Record Found');
                } else if (widget.widgetType === 'CHART') {
                    // Build ApexCharts options and store on the widget so
                    // the <apx-chart> binding in the template picks it up.
                    widget.chartOptions = this._chart.getChartData(widget);
                } else if (widget.widgetType === 'PROGRESS') {
                    widget.chartOptions = this._chart.getProgressData(widget);
                }
                widget.isLoading = false;
                this.cdr.markForCheck();
            },
            error: () => {
                widget.isLoading = false;
                this.cdr.markForCheck();
            },
        });
    }

    getWidgetGridData(widget: WidgetModel, isGridData: boolean) {
        const inputFilter = this.getFilterInputs(widget);
        // getFilterInputs returns null when filterColumns is still a raw string
        // (edge case during init). Guard against it to prevent a crash.
        if (inputFilter === null) {
            widget.isLoading = false;
            return;
        }
        widget.isLoading = true;
        inputFilter.limit = isGridData ? widget.inputs?.limit ?? 5 : 50;
        // Keep limitFrom so pagination state persists on reload
        inputFilter.limitFrom = widget.inputs?.limitFrom ?? 0;

        widget.inputs = inputFilter;

        const tempInput: any = {
            title: widget.customTitle || widget.widgetTitle,
            widgetCode: widget.widgetCode,
            reportId: widget.widgetCode,
            exportAs: '',
            inputs: { ...inputFilter, ...this.defaultInput, ...this._data.globalFilterValues },
            columns: widget.dataColumns,
        };

        const countInputFilter = { ...inputFilter };
        delete countInputFilter.limit;
        delete countInputFilter.limitFrom;

        const countTempInput: any = {
            ...tempInput,
            inputs: { ...countInputFilter, ...this.defaultInput, ...this._data.globalFilterValues },

        };
        const fetchWidgetData = () => {
            this.http.post(sessionStorage.getItem('apiUrl') + 'report/widget-data', tempInput).subscribe({
                next: (e: any) => {
                    const rows: any[] = e.data ?? [];
                    if (rows.length === 0) {
                        this._ui.infoAlert('No Record Found');
                    }
                    if (
                        (widget.widgetProperties as any)?.haveDynamicColumns ||
                        !Array.isArray(widget.dataColumns) ||
                        widget.dataColumns.length === 0
                    ) {
                        widget.dataColumns = e.dataColumns ?? widget.dataColumns ?? [];
                    }
                    widget.templateReference = {};
                    widget.dataColumns.forEach((col: any) => {
                        if (col.templateReference === 'actionButton') {
                            widget.templateReference[col.field] = this.actionButtonRef;
                        }
                    });
                    widget.dataColumns = [...widget.dataColumns];
                    widget.data = [...rows];
                    widget.isLoading = false;
                    this.cdr.markForCheck();
                },
                error: () => {
                    widget.isLoading = false;
                    this.cdr.markForCheck();
                },
            });
        };
        if (isGridData) {
            this.http.post(sessionStorage.getItem('apiUrl') + 'report/widget-count', countTempInput).subscribe({
                next: (countRes: any) => {
                    widget.totalRecords = countRes.count || 0;
                    fetchWidgetData();
                },
                error: () => {
                    widget.isLoading = false;
                    this.cdr.markForCheck();
                },
            });
        } else {
            fetchWidgetData();
        }
    }

    onGridNextPageClicked(widget: WidgetModel, e: PageEvent) {
        if (!widget.inputs) {
            widget.inputs = {};
        }
        widget.inputs.limitFrom = e.pageIndex * e.pageSize;
        widget.inputs.limit = e.pageSize;

        const inputFilter = this.getFilterInputs(widget);
        if (!inputFilter) return;

        inputFilter.limitFrom = widget.inputs.limitFrom;
        inputFilter.limit = widget.inputs.limit;

        widget.isLoading = true;

        const tempInput = {
            title: widget.customTitle || widget.widgetTitle,
            widgetCode: widget.widgetCode,
            reportId: widget.widgetCode,
            exportAs: 'GRID',
            inputs: { ...inputFilter, ...this.defaultInput, ...this._data.globalFilterValues },
            columns: widget.dataColumns,
        };

        this.http.post(sessionStorage.getItem('apiUrl') + 'report/widget-data', tempInput).subscribe({
            next: (res: any) => {
                const rows = res.data ?? [];
                if (rows.length === 0) {
                    this._ui.infoAlert('No Record Found');
                }
                widget.data = [...rows];
                widget.isLoading = false;
                this.cdr.markForCheck();
            },
            error: () => {
                widget.isLoading = false;
                this.cdr.markForCheck();
            },
        });
    }

    // -----------------------------------------------------------------------
    // Filter helpers
    // -----------------------------------------------------------------------

    getFilterInputs(widget: WidgetModel) {
        const inputFilter = { ...widget.inputs };
        if (typeof widget.filterColumns === 'string') return null;
        widget.filterColumns.forEach((item: any) => {
            if (item.mandatory && !item.value) {
                this._ui.errorAlert('Please Fill All Mandatory Fields');
                return;
            }
            if (item.dataType === 'DATE') {
                inputFilter[item.code] = this.datePipe.transform(new Date(item.value), 'yyyy-MM-dd');
            } else {
                inputFilter[item.code] = item.value ?? '';
            }
        });
        return inputFilter;
    }

    // -----------------------------------------------------------------------
    // Generate / Export
    // -----------------------------------------------------------------------

    onGenerateClicked(widget: WidgetModel, actionCode: string) {
        if (actionCode === 'RELOAD') {
            this.getWidgetData(widget);
            return;
        }
        widget.viewType = ['TXT-VIEW', 'GRID'].includes(actionCode) ? actionCode : widget.viewType;
        const inputFilter = this.getFilterInputs(widget);
        if (!inputFilter) return;
        widget.isLoading = true;
        widget.exportAs = actionCode === 'TXT-VIEW' ? 'TXT' : actionCode;
        if (actionCode === 'GRID') {
            this.getWidgetData(widget);
        } else {
            widget.exportAs = actionCode;
            if (widget.chart) {
                widget.chart.dataURI().then((uri: any) => {
                    this.exportWidget(widget, widget, actionCode);
                });
            } else {
                this.exportWidget(widget, widget, actionCode);
            }
        }
    }

    exportWidget(widget: WidgetModel, tempInput: any, actionCode: string) {
        const headers = new HttpHeaders({ Accept: 'application/pdf' });
        this.http
            .post(sessionStorage.getItem('apiUrl') + 'report/widget-export', tempInput, {
                headers,
                responseType: 'blob',
            })
            .subscribe(
                (data: any) => {
                    widget.isLoading = false;
                    if (actionCode === 'TXT-VIEW') {
                        const reader = new FileReader();
                        reader.onload = () => {
                            widget.data = [reader.result];
                        };
                        reader.readAsText(data);
                    } else {
                        this._ui.downloadFile(data, tempInput.title + '.' + tempInput.exportAs.toLowerCase());
                    }
                },
                () => {
                    this._ui.systemErrorAlert();
                    widget.isLoading = false;
                }
            );
    }

    // -----------------------------------------------------------------------
    // Widget filter dialog
    // -----------------------------------------------------------------------

    onWidgetFilterClicked(index: number) {
        this.selectedWidgetIndex = index;
        this.dialogRef = this.dialog.open(this.filterDialogRef, {
            width: '60%',
            data: {},
        });
    }

    onWidgetApplyFilterClicked() {
        this.getWidgetData(this._data.dashboardInfo.reportWidgets[this.selectedWidgetIndex]);
        this.dialogRef.close();
    }

    onWidgetFilterCloseClicked() {
        this.dialogRef.close();
    }

    // -----------------------------------------------------------------------
    // Global filter
    // -----------------------------------------------------------------------

    onGlobalFilterApplyClicked() {
        this._data.dashboardInfo.reportWidgets.forEach((widget: any) => {
            widget.filterColumns.forEach((e: any) => {
                e.value = this._data.globalFilter.find((gf: any) => gf.code === e.code)?.value || e.value;
            });
            this.getWidgetData(widget);
        });
    }

    // -----------------------------------------------------------------------
    // Grid actions
    // -----------------------------------------------------------------------

    onGridActionClicked(row: any, actionInfo: GridActionButtonModel) {
        // Extend here for row-level action handling
    }

    onGlobalFilterChanged(item: any) {
        console.log(item);
        this.refreshDashboard();
    }

    // -----------------------------------------------------------------------
    // Layout helpers
    // -----------------------------------------------------------------------

    /**
     * Maps a widget's widthPercentage (e.g. 25, 33, 50, 66, 75, 100) to a
     * Tailwind CSS grid column-span class string.
     * On mobile the widget always takes the full width (col-span-12).
     * On md+ screens it respects the configured percentage.
     *
     * Width → span mapping (12-column grid):
     *   ≤ 25% → md:col-span-3
     *   ≤ 33% → md:col-span-4
     *   ≤ 50% → md:col-span-6
     *   ≤ 66% → md:col-span-8
     *   ≤ 75% → md:col-span-9
     *   else  → col-span-12 (full row)
     */
    getGridSpanClass(widthPercentage: number): string {
        const w = widthPercentage || 100;
        if (w <= 20) return 'col-span-12 md:col-span-2';
        if (w <= 25) return 'col-span-12 md:col-span-3';
        if (w <= 33) return 'col-span-12 md:col-span-4';
        if (w <= 50) return 'col-span-12 md:col-span-6';
        if (w <= 66) return 'col-span-12 md:col-span-8';
        if (w <= 75) return 'col-span-12 md:col-span-9';
        return 'col-span-12';
    }
}
