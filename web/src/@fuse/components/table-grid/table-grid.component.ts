import {
    ChangeDetectionStrategy,
    Component,
    Input,
    OnChanges,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {fuseAnimations} from '@fuse/animations';
import {
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatTable,
    MatTableDataSource
} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {MatTooltip} from "@angular/material/tooltip";
import {MatSort, MatSortHeader, Sort} from "@angular/material/sort";
import {FuseConfirmationService} from "../../services/confirmation";
import {NgTemplateOutlet} from "@angular/common";


export interface CkTableColumn {
    header: string;    // Header text
    column: string;    // Field name in the data source
    width?: string;    // Optional width of the column
    sortable?: boolean;  // Sortable flag
    resizable?: boolean; // Resizable flag (if needed for further implementation)
    formatter?: (value: any, row: any) => string | HTMLElement; // Optional custom formatter
    template?: any; // Optional custom template
}

export interface CkTableAction {
    label: string;
    icon?: string;
    svgIcon?: string;
    iff?: (row: any) => boolean;
    action: (row: any) => void;
    color?: "warn" | "primary" | "error" | "warning" | "basic" | "info" | "success";
    confirm?: boolean;
    confirmTitle?: string;
    confirmIconColor?: "warn" | "primary" | "accent" | "error" | "warning" | "basic" | "info" | "success";
    confirmIcon?: string;
    confirmMessage?: string;
    yesText?: string | 'Yes' | 'Okay';
    noText?: string | 'No' | 'Cancel';
}

export interface CkTable {
    viewType?: 'table' | 'card';
    gridData: any[];
    columns: CkTableColumn[];
    actions?: CkTableAction[];
    isShowFilter?: boolean | false;
    totalRecords?: number;
    showPagination?: boolean | false;
    pageIndex?: number;
    pageSize?: number;
    loading?: boolean;
    filterValue?: any | '';
    sortColumn?: string;
    sortDirection?: string;
    pageSizeOptions?: number[] | [5, 10, 20];
    onPageChanged?: (event: any) => void;
    onRowClicked?: (row: any) => void;
    onCellClicked?: (cell: CkTableColumn, row: any) => void;
    onSortChanged?: (event: any) => void;
}

@Component({
    selector: 'ck-table-grid',
    templateUrl: './table-grid.component.html',
    styleUrls: ['./table-grid.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations,
    exportAs: 'ckTableGrid',
    standalone: true,
    imports: [MatIconModule, MatButtonModule, MatPaginator, MatRowDef, MatRow, MatHeaderRow, MatHeaderRowDef,
        MatTooltip, MatHeaderCellDef, MatCell, MatHeaderCell, MatColumnDef, MatSortHeader, MatCellDef, MatTable,
        MatSort, NgTemplateOutlet],
})
export class FuseAlertComponent implements OnInit, OnChanges {

    @Input() properties: CkTable;

    columns: CkTableColumn[]; // Array of TableColumn objects
    dataSource: MatTableDataSource<any>; // Data source for the table
    actions: CkTableAction[] = []; // List of actions (optional)
    displayedColumns: string[] = [];
    viewType: 'table' | 'card';
    private _paginator: MatPaginator;

    @ViewChild(MatPaginator) set paginator(mp: MatPaginator) {
        this._paginator = mp;
        if (this.dataSource) {
            this.dataSource.paginator = mp;
        }
    }

    get paginator(): MatPaginator {
        return this._paginator;
    }

    constructor(private _fuseConfirmationService: FuseConfirmationService) {
    }

    ngOnInit(): void {
        this.columns = this.properties.columns;
        this.actions = this.properties.actions;
        this.viewType = this.properties.viewType || 'table';
        this.dataSource = new MatTableDataSource(this.properties.gridData);
        if (this.dataSource) {
            this.dataSource.paginator = this.paginator;
        }
        this.displayedColumns = this.columns.map(c => c.column);
        if (this.actions.length > 0) {
            this.displayedColumns.push('actions');
        }
        this.displayedColumns = this.columns.map(c => c.column);
        if (this.actions.length > 0) {
            this.displayedColumns.push('actions');
        }
    }

    ngOnChanges() {
        if (this.dataSource) {
            // Create a new array reference to ensure change detection
            this.dataSource.data = [...this.properties.gridData];
        }

        // Update columns if they've changed
        if (this.properties && this.properties.columns) {
            this.columns = [...this.properties.columns];
            this.displayedColumns = this.columns.map(c => c.column);
            if (this.actions && this.actions.length > 0) {
                this.displayedColumns.push('actions');
            }
        }
    }

    // Perform an action on a row
    executeAction(action: CkTableAction, row: any) {
        if (action.confirm) {
            const confirmation = this._fuseConfirmationService.open({
                title: action.confirmTitle || 'Confirmation?',
                message: action.confirmMessage || 'Do you really want to perform this task? This action cannot be undone!',
                actions: {confirm: {label: action.yesText || 'Okay',}, cancel: {label: action.noText || 'Cancel',}},
                icon: {
                    show: true,
                    color: action.confirmIconColor || 'warning',
                    name: action.confirmIcon || 'heroicons_outline:exclamation',
                }
            });
            confirmation.afterClosed().subscribe((result) => {
                if (result === 'confirmed') {
                    action.action(row);
                }
            });
        } else {
            action.action(row);
        }

    }

    // Utility to apply formatter if it exists
    getFormattedValue(column: CkTableColumn, row: any) {
        if (column.formatter) {
            return column.formatter(row[column.column], row);
        }
        return row[column.column];
    }

    onPageChange(event: any) {
        this.properties.pageIndex = event.pageIndex;
        this.properties.pageSize = event.pageSize;
        if (this.properties.onPageChanged) {
            this.properties.onPageChanged(event);
        }
    }

    onRowClicked(row: any) {
        if (this.properties && this.properties.onRowClicked) {
            this.properties.onRowClicked(row);
        }
    }

    onCellClicked(cell: CkTableColumn, row: any) {
        if (this.properties && this.properties.onCellClicked) {
            this.properties.onCellClicked(cell, row);
        }
    }

    onSortChange(sort: Sort) {
        if (this.properties && this.properties.onSortChanged) {
            this.properties.onSortChanged(sort);
        }
    }

}
