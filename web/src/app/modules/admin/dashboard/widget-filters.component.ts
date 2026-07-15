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
         @for (item of filterColumns;
                track item.code) { <div class="w-44 flex-shrink-0">
                    @switch (item.control) {
                    @case ('INPUT') {
                    <mat-form-field class="w-full" appearance="outline" subscriptSizing="dynamic">
                        <mat-label>{{ item.label }}</mat-label>
                        <input matInput [placeholder]="'Enter ' + item.label" [(ngModel)]="item.value"
                            [required]="item.mandatory">
                    </mat-form-field>
                    }
                    @case ('DROPDOWN') {
                    <mat-form-field class="w-full" appearance="outline" subscriptSizing="dynamic">
                        <mat-label>{{ item.label }}</mat-label>
                        <mat-select [(ngModel)]="item.value" (selectionChange)="onDropdownSelectionChange(item)"
                            [required]="item.mandatory">
                            @for (dropItem of item.dropdownOptions; track dropItem.value) {
                            <mat-option [value]="dropItem.value">{{ dropItem.label }}</mat-option>
                            }
                        </mat-select>
                    </mat-form-field>
                    }
                    @case ('DATEPICKER') {
                    <mat-form-field class="w-full" appearance="outline" subscriptSizing="dynamic">
                        <mat-label>{{ item.label }}</mat-label>
                        <input matInput [matDatepicker]="pickerWidget" [(ngModel)]="item.value"
                            [required]="item.mandatory">
                        <mat-datepicker-toggle matSuffix [for]="pickerWidget"></mat-datepicker-toggle>
                        <mat-datepicker #pickerWidget></mat-datepicker>
                    </mat-form-field>
                    }
                    }
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
