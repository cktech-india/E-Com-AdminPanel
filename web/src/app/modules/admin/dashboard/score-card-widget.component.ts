import { UpperCasePipe } from '@angular/common';
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
    selector: 'app-dashboard-status-count-widget',
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
        UpperCasePipe,
    ],
    template: `
        @if (widget.widgetSubType === 'STATUS_COUNT') {
            <mat-card class="rounded-2xl border-0 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500 overflow-hidden relative bg-white">
                <div class="absolute -right-10 -top-10 w-40 h-40 rounded-full blur-3xl opacity-40 {{ _chart.getColorClass(widget?.data[0]?.iconColor || 'blue', 'BG') }}"></div>
                <mat-card-content class="relative z-10 p-6">
                    @if (widget?.data?.length > 0) {
                        <div class="flex items-center">
                            <div class="flex-1">
                                <p class="mb-4 text-sm font-semibold uppercase text-slate-400">
                                    {{ widget.customTitle || widget.widgetTitle }}
                                </p>
                                <div
                                    class="text-3xl font-bold mt-1 {{
                                        _chart.getColorClass(widget?.data[0]?.valueColor || 'blue', 'TXT')
                                    }} "
                                >
                                    {{ widget?.data[0]?.value || '0' }}
                                </div>
                                <div
                                    class="text-sm text-secondary mt-1 {{
                                        _chart.getColorClass(widget?.data[0]?.secondaryValueColor || 'blue', 'TXT')
                                    }}"
                                >
                                    @if (widget?.data[0]?.secondaryIcon) {
                                        <mat-icon
                                            class="text-sm {{
                                                _chart.getColorClass(
                                                    widget?.data[0]?.secondaryValueColor || 'blue',
                                                    'TXT'
                                                )
                                            }}"
                                            >{{ widget?.data[0]?.secondaryIcon }}
                                        </mat-icon>
                                    }
                                    {{ widget?.data[0]?.secondaryValue }}
                                </div>
                            </div>
                            <div
                                class="w-12 h-12 rounded-full flex items-center justify-center {{
                                    _chart.getColorClass(widget?.data[0]?.iconColor || 'blue', 'BG_LITE')
                                }}"
                            >
                                <mat-icon
                                    class="{{ _chart.getColorClass(widget?.data[0]?.iconColor || 'blue', 'TXT') }}"
                                    >{{ widget?.data[0]?.icon || 'insights' }}
                                </mat-icon>
                            </div>
                        </div>
                    } @else {
                        <div class="flex flex-col items-center justify-center gap-2 text-red-600">
                            <mat-icon class="scale-125">error_outline</mat-icon>
                            <span class="text-sm font-medium">
                                {{ 'No Data!!!' | uppercase }}
                            </span>
                        </div>
                    }
                </mat-card-content>
            </mat-card>
        } @else if (widget.widgetSubType === 'STATUS_COUNT_MULTI') {
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                @for (item of widget?.data; track item.title) {
                    <mat-card class="rounded-2xl border border-slate-100 dark:border-slate-800 shadow-[0_4px_25px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_35px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 overflow-hidden relative bg-white dark:bg-slate-900">
                        <div class="absolute -right-10 -top-10 w-36 h-36 rounded-full blur-3xl opacity-20 {{ _chart.getColorClass(item.iconColor || 'blue', 'BG') }}"></div>
                        <mat-card-content class="relative z-10 p-6">
                            <div class="flex items-center justify-between">
                                <div class="flex-1 min-w-0 pr-3">
                                    <p class="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate">
                                        {{ item.title || item.customTitle || item.widgetTitle }}
                                    </p>
                                    <div class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-50">
                                        {{ item.value || '0' }}
                                    </div>
                                    @if (item.secondaryValue) {
                                        <div class="text-xs text-slate-400 dark:text-slate-500 mt-1.5 flex items-center gap-0.5">
                                            @if (item.secondaryIcon) {
                                                <mat-icon class="text-xs w-3.5 h-3.5 flex items-center justify-center">{{ item.secondaryIcon }}</mat-icon>
                                            }
                                            <span>{{ item.secondaryValue }}</span>
                                        </div>
                                    }
                                </div>
                                <div class="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 hover:scale-110 shadow-sm {{ _chart.getColorClass(item.iconColor || 'blue', 'BG_LITE') }}">
                                    <mat-icon class="{{ _chart.getColorClass(item.iconColor || 'blue', 'TXT') }}">{{ item.icon || 'insights' }}</mat-icon>
                                </div>
                            </div>
                        </mat-card-content>
                    </mat-card>
                }
            </div>
        } @else if (widget.widgetSubType === 'STATUS_COUNT_GROUP') {
            <div class="rounded-2xl border-0 bg-white p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500 relative overflow-hidden lg:col-span-2">
                <div class="absolute -right-20 -bottom-20 w-64 h-64 rounded-full blur-3xl opacity-20 bg-indigo-500"></div>
                <div class="absolute -left-10 -top-10 w-40 h-40 rounded-full blur-3xl opacity-20 bg-emerald-500"></div>
                <div class="relative z-10">
                    <p class="mb-6 text-sm font-semibold uppercase text-slate-400 tracking-wider">
                        {{ widget.customTitle || widget.widgetTitle }}
                    </p>
                    <div class="grid  grid-flow-col auto-cols-fr gap-6">
                        @for (item of widget?.data; track item.title) {
                            <div class="flex items-center gap-4 {{ $last ? '' : 'border-r border-slate-100' }} pr-6 transition-transform hover:scale-105 duration-300">
                            @if (item.icon) {
                                <div
                                    class="w-12 h-12 rounded-full flex items-center justify-center {{
                                        _chart.getColorClass(item.iconColor || 'blue', 'BG_LITE')
                                    }}"
                                >
                                    <mat-icon class="{{ _chart.getColorClass(item.iconColor || 'blue', 'TXT') }}"
                                        >{{ item.icon || 'insights' }}
                                    </mat-icon>
                                </div>
                            }

                            <div class="flex flex-col justify-center">
                                <p
                                    class="text-xs uppercase leading-tight {{
                                        _chart.getColorClass(item.valueColor || 'blue', 'TXT')
                                    }}"
                                >
                                    {{ item.title }}
                                </p>
                                <p
                                    class="text-xl font-bold leading-tight {{
                                        _chart.getColorClass(item.valueColor || 'blue', 'TXT')
                                    }}"
                                >
                                    {{ item.value }}
                                </p>
                            </div>
                        </div>
                    }
                </div>
            </div>
            </div>
        } @else {
            <div class="mui-shadow-4 rounded-2xl border bg-white p-6">
                <div class="mb-2 flex items-center justify-between">
                    <span class="text-sm font-medium text-red-700">No Progress Defined</span>
                </div>
            </div>
        }
    `,
    encapsulation: ViewEncapsulation.None,
})
export class ScoreCardWidgetComponent implements OnInit {
    @Input() widget: WidgetModel;

    constructor(protected _chart: ChartService) { }

    ngOnInit(): void {
        this.widget.chartOptions = this._chart.getProgressData(this.widget);
    }
}
