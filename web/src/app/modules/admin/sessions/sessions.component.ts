import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SelectionModel } from '@angular/cdk/collections';
import { EntityApiService } from '../../shared/api-services/entity.api.service';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'sessions',
    templateUrl: './sessions.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        CommonModule, 
        MatButtonModule, 
        MatIconModule, 
        MatTableModule, 
        MatTooltipModule, 
        MatPaginatorModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatInputModule
    ],
})
export class SessionsComponent implements OnInit {
    sessions: MatTableDataSource<any> = new MatTableDataSource();
    displayedColumns: string[] = ['select', 'userName', 'userCode', 'loginTime', 'actions'];
    selection = new SelectionModel<any>(true, []);

    @ViewChild(MatPaginator) paginator: MatPaginator;

    constructor(
        private _entityService: EntityApiService,
        private _toastr: ToastrService
    ) {}

    ngOnInit(): void {
        this.loadSessions();
    }

    loadSessions(): void {
        this._entityService.getDataByProcessName('ACTIVE_SESSIONS', {}).subscribe(
            (response: any) => {
                this.sessions = new MatTableDataSource(response);
                this.sessions.paginator = this.paginator;
                this.selection.clear();
            },
            (error) => {
                this._toastr.error('Failed to load active sessions');
            }
        );
    }

    applyFilter(event: Event): void {
        const filterValue = (event.target as HTMLInputElement).value;
        this.sessions.filter = filterValue.trim().toLowerCase();

        if (this.sessions.paginator) {
            this.sessions.paginator.firstPage();
        }
    }

    /** Whether the number of selected elements matches the total number of rows. */
    isAllSelected(): boolean {
        const numSelected = this.selection.selected.filter(s => this.sessions.filteredData.includes(s)).length;
        const numRows = this.sessions.filteredData.length;
        return numRows > 0 && numSelected === numRows;
    }

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggle(): void {
        if (this.isAllSelected()) {
            this.sessions.filteredData.forEach(row => this.selection.deselect(row));
        } else {
            this.sessions.filteredData.forEach(row => this.selection.select(row));
        }
    }

    killSession(session: any): void {
        if (confirm(`Are you sure you want to kill the session for ${session.userName}?`)) {
            this._entityService.storeDataByProcessName('UPDATE_USER_TOKEN_IN_ACTIVE', [{ token: session.token }]).subscribe(
                () => {
                    this._toastr.success('Session killed successfully');
                    this.loadSessions();
                },
                () => {
                    this._toastr.error('Failed to kill session');
                }
            );
        }
    }

    killBulkSessions(): void {
        const selectedSessions = this.selection.selected;
        if (selectedSessions.length === 0) return;

        if (confirm(`Are you sure you want to kill ${selectedSessions.length} selected sessions?`)) {
            const tokens = selectedSessions.map(s => ({ token: s.token }));
            this._entityService.storeDataByProcessName('UPDATE_USER_TOKEN_IN_ACTIVE', tokens).subscribe(
                () => {
                    this._toastr.success(`${selectedSessions.length} sessions killed successfully`);
                    this.loadSessions();
                },
                () => {
                    this._toastr.error('Failed to kill sessions');
                }
            );
        }
    }
}
