import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UiService } from '../../../../ui.service';
import { EntityApiService } from '../../../shared/api-services/entity.api.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCard, MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { FuseAlertComponent } from '@fuse/components/table-grid/table-grid.component';

@Component({
    selector: 'app-screen-master',
    templateUrl: './screens.component.html',
    styleUrls: ['./screens.component.css'],
    standalone: true,
    imports: [
        FormsModule,
        MatButtonModule,
        MatCard,
        MatCardModule,
        MatDividerModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatSortModule,
        MatTableModule,
        FuseAlertComponent,
    ]
})
export class ScreensComponent implements OnInit {

    // ================= DATA =================
    dataSource= new MatTableDataSource<any>([]);
    displayedColumns: string[] = [];
    moduleList: string[] = [];

selectedModule: string = '';

searchText: string = '';

    dropdownOptions: any = {};

    // ================= COLUMN CONFIG =================
    columnDef: any[] = [
        { header: 'Display Name', field: 'entityName', controlType: 'INPUT' },
        { header: 'Module Name', field: 'moduleName', controlType: 'INPUT' },
        { header: 'Sub Module', field: 'subModuleName', controlType: 'INPUT' },
        { header: 'Screen Name', field: 'screenName', controlType: 'INPUT' },
        { header: 'Sequence No', field: 'sequenceNo', controlType: 'INPUT_NUMBER' },
        { header: 'Screen Icon', field: 'screenIcon', controlType: 'DROPDOWN' },
        { header: 'Active', field: 'isActive', controlType: 'TOGGLE' }
    ];

    constructor(
        public ui: UiService,
        private _service: EntityApiService
    ) {}

    // ================= INIT =================
    ngOnInit(): void {

        this.displayedColumns = this.columnDef.map(c => c.field);

        this.dropdownOptions = {
            screenCode_DropdownOptions: this.getMatIcons()
        };

        this.getGridData();
        this.dataSource.filterPredicate = (
        data: any,
        filter: string
    ): boolean => {

        const search = JSON.parse(filter);

        const matchesText =
            Object.values(data)
                .join(' ')
                .toLowerCase()
                .includes(search.text);

        const matchesModule =
            !search.module ||
            data.moduleName === search.module;

        return matchesText && matchesModule;
    };

    }
applyFilter(event: Event): void {
    this.searchText = (event.target as HTMLInputElement).value
        .trim()
        .toLowerCase();

    this.dataSource.filter = JSON.stringify({
        text: this.searchText,
        module: this.selectedModule
    });
}
applyModuleFilter(): void {
    this.dataSource.filter = JSON.stringify({
        text: this.searchText,
        module: this.selectedModule
    });
}
    // ================= LOAD DATA =================
    getGridData() {
        this._service.getScreenList().subscribe({
            next: (res: any[]) => {
                this.dataSource.data = res || [];
                this.dataSource.data.forEach((e: any) => {
                    e.recordMode = 'E';
                });
                this.moduleList = [
                    ...new Set(res.map((x: any) => x.moduleName))
                ];
            },
            error: () => {
                this.ui.systemErrorAlert();
            }
        });
    }

    // ================= SAVE =================
    onSaveClicked() {
        this.ui.showConfirmationSimple('Are You Sure to Save? ')
            .subscribe((confirmed: boolean) => {

                if (!confirmed) return;

                const tempData = [...this.dataSource.data];

                this._service.saveScreen(tempData)
                    .subscribe({
                        next: (res: any) => {
                            if (res.status === 'SAVED') {
                                this.ui.saveAlert();
                                this.getGridData();
                            } else {
                                this.ui.errorAlert(res.message || 'Save failed');
                            }
                        },
                        error: () => {
                            this.ui.systemErrorAlert();
                        }
                    });
            });
    }

    // ================= ICON LIST =================
    getMatIcons() {
        let iconsList = [
            '3d_rotation','accessibility','accessibility_new','accessible',
            'accessible_forward','account_balance','account_balance_wallet',
            'account_box','account_circle','add_shopping_cart','alarm',
            'alarm_add','alarm_off','alarm_on','all_inbox','all_out','android',
            'announcement','arrow_right_alt','aspect_ratio','assessment',
            'assignment','assignment_ind','assignment_late','assignment_return',
            'assignment_returned','assignment_turned_in','autorenew','backup',
            'book','bookmark','bookmark_border','bookmarks','bug_report',
            'build','cached'
        ];

        iconsList = iconsList.concat(
            'add_alert', 'error', 'error_outline',
            'notification_important', 'warning'
        );

        return iconsList.map(e => ({
            id: e,
            name: e
        }));
    }
}