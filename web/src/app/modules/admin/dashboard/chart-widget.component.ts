import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

@Component({
    selector: 'app-dashboard-chart-widget',
    standalone: true,
    imports: [
        CommonModule,
        NgApexchartsModule,
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        MatMenuModule,
        MatTooltipModule,
        MatDividerModule
    ],
    template: `
        <mat-card class="rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 bg-white dark:bg-slate-900">
            <div class="h-1.5 w-full bg-gradient-to-r from-emerald-400 to-cyan-500 opacity-90"></div>
            <mat-card-header class="pb-2 pt-4 px-6 relative z-10">
                <div class="flex w-full items-center justify-between">
                    <mat-card-title class="text-base font-semibold m-0 text-slate-800 dark:text-slate-50">
                        {{ widget.customTitle || widget.widgetTitle }}
                    </mat-card-title>
                    <div class="flex items-center gap-1">
                        <button mat-icon-button [matMenuTriggerFor]="widgetMenu" matTooltip="More Options">
                            <mat-icon>more_vert</mat-icon>
                        </button>
                    </div>
                </div>
            </mat-card-header>
            <mat-divider class="mx-6 mt-1 opacity-50"></mat-divider>
            <mat-card-content class="pt-4 px-6 pb-6 relative z-10">
                @if (widget.isLoading) {
                    <div class="flex justify-center items-center py-10">
                        <mat-icon class="animate-spin text-primary">autorenew</mat-icon>
                        <span class="ml-2 text-sm text-gray-500">Loading...</span>
                    </div>
                } @else if (widget.chartOptions) {
                    <apx-chart [series]="widget.chartOptions.series" [chart]="widget.chartOptions.chart"
                               [labels]="widget.chartOptions.labels" [grid]="{show: false}"
                               [xaxis]="widget.chartOptions.xaxis" [yaxis]="widget.chartOptions.yaxis"
                               [plotOptions]="widget.chartOptions.plotOptions"
                               [dataLabels]="widget.chartOptions.dataLabels" [stroke]="widget.chartOptions.stroke"
                               [fill]="widget.chartOptions.fill" [legend]="widget.chartOptions.legend"
                               [tooltip]="widget.chartOptions.tooltip" [responsive]="widget.chartOptions.responsive"
                               [colors]="widget.chartOptions.colors" [markers]="widget.chartOptions.markers"
                               [theme]="widget.chartOptions.theme"></apx-chart>
                } @else {
                    <div class="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-slate-600">
                        <mat-icon class="text-5xl mb-2">bar_chart</mat-icon>
                        <p class="text-sm">No chart data available.</p>
                    </div>
                }
            </mat-card-content>
        </mat-card>

        <mat-menu #widgetMenu="matMenu">
            <button mat-menu-item (click)="reloadClicked.emit(widget)">
                <mat-icon>refresh</mat-icon>
                <span>Reload</span>
            </button>
        </mat-menu>
    `
})
export class ChartWidgetComponent {
    @Input() widget: any;
    @Output() reloadClicked = new EventEmitter<any>();
}
