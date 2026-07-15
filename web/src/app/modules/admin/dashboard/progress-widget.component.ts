import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ChartService, WidgetModel } from './chart.service';

@Component({
    selector: 'app-dashboard-progress-widget',
    standalone: true,
    imports: [
        // Angular
        FormsModule,
        // Angular Material
        MatTabsModule,
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        MatDividerModule,
        MatTableModule,
        MatPaginatorModule,
        NgApexchartsModule,
    ],
    template: `
        @if (widget.widgetSubType === 'PROGRESS') {
            <div class="rounded-2xl border-0 bg-white p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500 relative overflow-hidden">
                <div class="absolute -right-20 -bottom-20 w-48 h-48 rounded-full blur-3xl opacity-20 {{ _chart.getColorClass(widget?.data[0]?.valueColor || 'blue', 'BG') }}"></div>
                <div class="relative z-10">
                    <div class="mb-4 flex items-center justify-between">
                        <p class="mb-0 text-sm font-semibold uppercase text-slate-400 tracking-wider">
                            {{ widget.customTitle || widget.widgetTitle }}
                        </p>
                    <span
                        class="text-sm font-medium {{
                            _chart.getColorClass(widget?.data[0]?.secondaryValueColor || 'blue', 'TXT')
                        }} "
                        >{{ widget?.data[0]?.title || widget.customTitle || widget.widgetTitle }}</span
                    >
                    <span
                        class="{{
                            _chart.getColorClass(widget?.data[0]?.valueColor || 'blue', 'TXT')
                        }} text-sm font-bold"
                        >{{ widget?.data[0]?.value || '0' }}%</span
                    >
                </div>
                <div
                    class="h-5 w-full overflow-hidden rounded-full {{
                        _chart.getColorClass(widget?.data[0]?.valueColor || 'blue', 'BG_LITE')
                    }}"
                >
                    <div
                        class="h-full rounded-full {{
                            _chart.getColorClass(widget?.data[0]?.valueColor || 'blue', 'BG')
                        }} transition-all duration-1000"
                        style="width: {{ widget?.data[0]?.value }}%"
                    ></div>
                </div>
                </div>
            </div>
        } @else if (widget.widgetSubType === 'PROGRESS_MULTI') {
            <div class="rounded-2xl border-0 bg-white p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500 relative overflow-hidden">
                <div class="absolute -left-20 -bottom-20 w-64 h-64 rounded-full blur-3xl opacity-10 bg-indigo-500"></div>
                <div class="relative z-10">
                    <p class="mb-6 text-sm font-semibold uppercase text-slate-400 tracking-wider">
                        {{ widget.customTitle || widget.widgetTitle }}
                    </p>
                    <div class="space-y-5">
                    @for (item of widget?.data; track item.title) {
                        <div>
                            <!--<div
                                class="w-8 h-8 rounded-full flex items-center justify-center {{
                                    _chart.getColorClass(item.iconColor || 'blue', 'BG_LITE')
                                }}"
                            >
                                <mat-icon class="icon-size-5 {{ _chart.getColorClass(item.iconColor || 'blue', 'TXT') }}"
                                    >{{ item?.icon || 'insights' }}
                                </mat-icon>
                            </div>-->
                            <div class="mb-1 flex justify-between text-xs">
                                <span>{{ item.title || widget.customTitle || widget.widgetTitle }}</span>
                                <span>{{ item.value }}%</span>
                            </div>
                            <div
                                class="h-3 w-full overflow-hidden rounded-full {{
                                    _chart.getColorClass(item.valueColor || 'blue', 'BG_LITE')
                                }}"
                            >
                                <div
                                    class="h-full {{ _chart.getColorClass(item.valueColor || 'blue', 'BG') }}"
                                    style="width: {{ item.value }}%"
                                ></div>
                            </div>
                        </div>
                    }
                    </div>
                </div>
            </div>
        } @else if (
            ['HALF_CIRCLE_PROGRESS', 'HALF_CIRCLE_PROGRESS_MULTI', 'CIRCLE_PROGRESS', 'CIRCLE_PROGRESS_MULTI'].includes(
                widget.widgetSubType
            )
        ) {
            <div class="rounded-2xl border-0 bg-white p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500 relative overflow-hidden">
                <div class="absolute -right-10 -top-10 w-48 h-48 rounded-full blur-3xl opacity-10 bg-purple-500"></div>
                <div class="relative z-10">
                    <p class="mb-4 text-sm font-semibold uppercase text-slate-400 tracking-wider">
                        {{ widget.customTitle || widget.widgetTitle }}
                    </p>
                <div class="mb-2 flex items-center justify-between">

                    <apx-chart
                        [series]="widget.chartOptions.series"
                        [chart]="widget.chartOptions.chart"
                        [labels]="widget.chartOptions.labels"
                        [xaxis]="widget.chartOptions.xaxis"
                        [yaxis]="widget.chartOptions.yaxis"
                        [plotOptions]="widget.chartOptions.plotOptions"
                        [dataLabels]="widget.chartOptions.dataLabels"
                        [stroke]="widget.chartOptions.stroke"
                        [fill]="widget.chartOptions.fill"
                        [legend]="widget.chartOptions.legend"
                        [tooltip]="widget.chartOptions.tooltip"
                        [responsive]="widget.chartOptions.responsive"
                        [colors]="widget.chartOptions.colors"
                        [markers]="widget.chartOptions.markers"
                        [theme]="widget.chartOptions.theme"
                    ></apx-chart>
                </div>
                </div>
            </div>
        } @else {
            <div class="rounded-2xl border-0 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                <div class="mb-2 flex items-center justify-between">
                    <span class="text-sm font-medium text-red-700">No Progress Defined</span>
                </div>
            </div>
        }
    `,
    encapsulation: ViewEncapsulation.None,
})
export class ProgressWidgetComponent implements OnInit {
    @Input() widget: WidgetModel;

    constructor(protected _chart: ChartService) {}

    ngOnInit(): void {
        if (!['PROGRESS', 'PROGRESS_MULTI'].includes(this.widget.widgetSubType)) {
            this.widget.chartOptions = this._chart.getProgressData(this.widget);
            // new ApexCharts(document.querySelector("#half-multi"),
        }
    }
}
