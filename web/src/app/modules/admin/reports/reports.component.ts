import { Component, OnInit, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';

import { GridWidgetComponent } from '../dashboard/grid-widget.component';
import { ChartWidgetComponent } from '../dashboard/chart-widget.component';
import { ScoreCardWidgetComponent } from '../dashboard/score-card-widget.component';
import { ProgressWidgetComponent } from '../dashboard/progress-widget.component';
import { ChartService } from '../dashboard/chart.service';
import { UiService } from '../../../ui.service';

@Component({
    selector: 'app-reports',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatSelectModule,
        MatOptionModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatDividerModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatTooltipModule,
        GridWidgetComponent,
        ChartWidgetComponent,
        ScoreCardWidgetComponent,
        ProgressWidgetComponent
    ],
    providers: [DatePipe],
    templateUrl: './reports.component.html',
    encapsulation: ViewEncapsulation.None
})
export class ReportsComponent implements OnInit {
    reports: any[] = [];
    selectedReport: any = null;
    selectedWidget: any = null;
    selectedWidgetCode: string = '';

    constructor(
        private http: HttpClient,
        private datePipe: DatePipe,
        private cdr: ChangeDetectorRef,
        private _chart: ChartService,
        private _ui: UiService
    ) {}

    ngOnInit(): void {
        this.loadReports();
    }

    loadReports(): void {
        const filters = { pageIndex: 0, pageSize: 100 };
        this.http.post(sessionStorage.getItem('apiUrl') + 'report/list-active', filters).subscribe({
            next: (res: any) => {
                this.reports = res ?? [];
                if (this.reports.length > 0) {
                    this.onReportChanged(this.reports[0]);
                }
            },
            error: () => {
                this._ui.infoAlert('Failed to load reports');
            }
        });
    }

    onReportChanged(report: any): void {
        this.selectedReport = report;
        this.selectedWidget = null;
        this.selectedWidgetCode = '';
        if (report?.reportWidgets?.length > 0) {
            this.onWidgetChanged(report.reportWidgets[0].widgetCode);
        }
    }

    onWidgetChanged(widgetCode: string): void {
        this.selectedWidgetCode = widgetCode;
        const widget = this.selectedReport?.reportWidgets?.find((w: any) => w.widgetCode === widgetCode);
        if (!widget) return;

        this.selectedWidget = widget;
        this.initWidget(this.selectedWidget);
    }

    initWidget(widget: any): void {
        if (!widget.inputs) {
            widget.inputs = { limit: 5, limitFrom: 0 };
        }
        
        // Reset or init filter columns
        if (widget.filterColumns) {
            widget.filterColumns.forEach((filter: any) => {
                if (filter.dataType === 'DATE' && !filter.value) {
                    filter.value = new Date();
                } else if (!filter.value) {
                    filter.value = filter.defaultValue || '';
                }
                widget.inputs[filter.code] = filter.value;
            });
        }
        
        this.getWidgetData();
    }

    getWidgetData(): void {
        const widget = this.selectedWidget;
        if (!widget) return;

        const filters = { ...widget.inputs };
        // Apply active filter inputs
        if (widget.filterColumns) {
            for (const filter of widget.filterColumns) {
                if (filter.mandatory && !filter.value) {
                    this._ui.errorAlert(`Please fill in: ${filter.label}`);
                    return;
                }
                if (filter.dataType === 'DATE') {
                    filters[filter.code] = this.datePipe.transform(new Date(filter.value), 'yyyy-MM-dd');
                } else {
                    filters[filter.code] = filter.value ?? '';
                }
            }
        }

        widget.isLoading = true;
        widget.inputs = filters;

        this.http.post(sessionStorage.getItem('apiUrl') + 'report/widget-data', widget).subscribe({
            next: (res: any) => {
                widget.data = res.data ?? [];
                if (widget.widgetType === 'CHART') {
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
            }
        });
    }

    onGridPageChange(eventData: any): void {
        const widget = eventData.widget;
        const e = eventData.event;
        widget.inputs.limitFrom = e.pageIndex * e.pageSize;
        widget.inputs.limit = e.pageSize;
        this.getWidgetData();
    }
}