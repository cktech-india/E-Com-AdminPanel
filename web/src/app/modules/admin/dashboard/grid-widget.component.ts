import { Component, Input, Output, EventEmitter, Pipe, PipeTransform, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule, NgTemplateOutlet, UpperCasePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

@Pipe({ name: 'columnFields', standalone: true })
export class ColumnFieldsPipe implements PipeTransform {
    transform(columns: any[]): string[] {
        if (!Array.isArray(columns)) return [];
        return columns.map((c) => c.field);
    }
}

@Component({
    selector: 'app-dashboard-grid-widget',
    standalone: true,
    imports: [
        CommonModule,
        NgTemplateOutlet,
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        MatMenuModule,
        MatTooltipModule,
        MatDividerModule,
        MatTableModule,
        MatPaginatorModule,
        ColumnFieldsPipe,
        UpperCasePipe
    ],
    template: `
        <mat-card class="rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 bg-white dark:bg-slate-900">
            <div class="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-90"></div>
            <mat-card-header class="pb-2 pt-4 px-6 relative z-10">
                <div class="flex w-full items-center justify-between">
                    <mat-card-title class="text-base font-semibold m-0 text-slate-800 dark:text-slate-50">
                        {{ widget.customTitle || widget.widgetTitle }}
                    </mat-card-title>
                    <div class="flex items-center gap-1">
                        @if ((widget?.filterColumns?.length ?? 0) > 0) {
                            <button mat-icon-button (click)="filterClicked.emit(idx)" matTooltip="Filter Data">
                                <mat-icon>filter_list</mat-icon>
                            </button>
                        }
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
                } @else if (widget?.data?.length > 0) {
                    <div class="overflow-auto">
                        <table mat-table [dataSource]="widget.data" class="w-full bg-transparent">
                            @for (col of widget.dataColumns; track col.field) {
                                <ng-container [matColumnDef]="col.field">
                                    <th mat-header-cell *matHeaderCellDef class="font-semibold text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                        {{ col.header }}
                                    </th>
                                    <td mat-cell *matCellDef="let row" class="text-slate-700 dark:text-slate-300">
                                        @if (col.templateReference === 'actionButton') {
                                            <ng-container [ngTemplateOutlet]="actionButton" [ngTemplateOutletContext]="{ $implicit: row, colDef: col }"></ng-container>
                                        } @else {
                                            {{ row[col.field] }}
                                        }
                                    </td>
                                </ng-container>
                            }
                            <tr mat-header-row *matHeaderRowDef="widget.dataColumns | columnFields"></tr>
                            <tr mat-row *matRowDef="let row; columns: widget.dataColumns | columnFields;" class="hover:bg-slate-50 dark:hover:bg-slate-800/40"></tr>
                        </table>
                    </div>
                    <mat-paginator [length]="widget.totalRecords || 0"
                                   [pageSize]="widget.inputs?.limit || 5"
                                   [pageIndex]="(widget.inputs?.limitFrom || 0) / (widget.inputs?.limit || 5)"
                                   (page)="pageClicked.emit({ widget: widget, event: $event })"
                                   [pageSizeOptions]="[5, 10, 25, 50]">
                    </mat-paginator>
                } @else {
                    <div class="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-slate-600">
                        <mat-icon class="text-5xl mb-2">inbox</mat-icon>
                        <p class="text-sm">No data available.</p>
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

        <!-- Template for action buttons if needed -->
        <ng-template #actionButton let-row let-col="colDef">
            @switch (col.type) {
                @case ('ICON') {
                    <button mat-icon-button (click)="actionClicked.emit({row: row, col: col})" [matTooltip]="col.tooltip || col.label" [color]="col.color">
                        <mat-icon>{{ col.icon }}</mat-icon>
                    </button>
                }
                @case ('BUTTON') {
                    <button mat-raised-button (click)="actionClicked.emit({row: row, col: col})" [matTooltip]="col.tooltip || col.label" [color]="col.color">
                        {{ col.label }}
                    </button>
                }
                @case ('ICON_BUTTON') {
                    <button mat-raised-button (click)="actionClicked.emit({row: row, col: col})" [matTooltip]="col.tooltip || col.label" color="accent">
                        <mat-icon>{{ col.icon }}</mat-icon>
                        {{ col.label }}
                    </button>
                }
            }
        </ng-template>
    `
})
export class GridWidgetComponent {
    @Input() widget: any;
    @Input() idx: number = 0;
    @Output() filterClicked = new EventEmitter<number>();
    @Output() actionClicked = new EventEmitter<{ row: any; col: any }>();
    @Output() pageClicked = new EventEmitter<{ widget: any; event: PageEvent }>();
    @Output() reloadClicked = new EventEmitter<any>();
}
