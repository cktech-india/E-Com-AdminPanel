import { Component, EventEmitter, Input, Output, ViewChild, TemplateRef, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UiService } from '@services/ui.service';
import { CkTableColumn } from '@fuse/components/table-grid/table-grid.component';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

@Component({
    selector: 'app-data-import-export',
    templateUrl: './data-import-export.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatDialogModule,
        MatTableModule,
        MatProgressSpinnerModule
    ]
})
export class DataImportExportComponent {

    @Input() columns: CkTableColumn[] = [];
    @Input() data: any[] = [];
    @Input() entityName: string = 'Data';
    @Input() entityType: string = ''; // e.g. "product", "category"
    @Output() onImportComplete = new EventEmitter<void>();

    @ViewChild('importDialogTpl') importDialogTpl!: TemplateRef<any>;

    dialogRef!: MatDialogRef<any>;
    selectedFile: File | null = null;
    previewData: any[] = [];
    previewColumns: string[] = [];
    isUploading: boolean = false;
    isSaving: boolean = false;

    constructor(
        private _dialog: MatDialog,
        private _http: HttpClient,
        private _uiService: UiService
    ) {}

    exportData(format: 'CSV' | 'XLSX'): void {
        if (!this.data || this.data.length === 0) {
            this._uiService.showToastr('Warning', 'No data to export', 'warning');
            return;
        }

        const headers = this.columns.map(col => col.header);
        const keys = this.columns.map(col => col.column);

        if (format === 'CSV') {
            const csvRows = [headers.join(',')];
            for (const row of this.data) {
                const values = this.columns.map(col => {
                    let val = row[col.column];
                    if (col.formatter) {
                        val = col.formatter(val, row);
                    }
                    val = val === null || val === undefined ? '' : String(val).replace(/"/g, '""');
                    return `"${val}"`;
                });
                csvRows.push(values.join(','));
            }
            const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
            saveAs(blob, `${this.entityName.toLowerCase()}_list.csv`);
            this._uiService.showToastr('Success', `${this.entityName} exported successfully.`, 'success');
        } else {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet(this.entityName);

            // Add Header Row
            const headerRow = worksheet.addRow(headers);
            headerRow.eachCell((cell) => {
                cell.font = { bold: true, color: { argb: 'FFFFFF' } };
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: '1E293B' } // slate-800
                };
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
            });

            // Add Data Rows
            for (const row of this.data) {
                const values = this.columns.map(col => {
                    let val = row[col.column];
                    if (col.formatter) {
                        val = col.formatter(val, row);
                    }
                    return val === null || val === undefined ? '' : val;
                });
                worksheet.addRow(values);
            }

            // Adjust Column Widths
            worksheet.columns.forEach((column) => {
                let maxLen = 10;
                column.eachCell!({ includeEmpty: true }, (cell) => {
                    const len = cell.value ? String(cell.value).length : 0;
                    if (len > maxLen) maxLen = len;
                });
                column.width = maxLen + 4;
            });

            workbook.xlsx.writeBuffer().then((buffer) => {
                const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                saveAs(blob, `${this.entityName.toLowerCase()}_list.xlsx`);
                this._uiService.showToastr('Success', `${this.entityName} exported successfully.`, 'success');
            });
        }
    }

    openImportDialog(): void {
        this.selectedFile = null;
        this.previewData = [];
        this.previewColumns = [];
        this.isUploading = false;
        this.isSaving = false;
        this.dialogRef = this._dialog.open(this.importDialogTpl, {
            width: '800px',
            disableClose: true
        });
    }

    downloadTemplate(format: 'CSV' | 'XLSX'): void {
        const headers = this.columns.map(col => col.header);

        if (format === 'CSV') {
            const csvContent = headers.join(',');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            saveAs(blob, `${this.entityName.toLowerCase()}_template.csv`);
        } else {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Template');
            
            const headerRow = worksheet.addRow(headers);
            headerRow.eachCell((cell) => {
                cell.font = { bold: true, color: { argb: 'FFFFFF' } };
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: '0F172A' }
                };
            });
            
            worksheet.columns.forEach((column) => {
                column.width = 20;
            });

            workbook.xlsx.writeBuffer().then((buffer) => {
                const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                saveAs(blob, `${this.entityName.toLowerCase()}_template.xlsx`);
            });
        }
    }

    onFileSelected(event: any): void {
        const file = event.target.files[0];
        if (file) {
            this.selectedFile = file;
            this.uploadAndPreview();
        }
    }

    uploadAndPreview(): void {
        if (!this.selectedFile) return;

        this.isUploading = true;
        const formData = new FormData();
        formData.append('file', this.selectedFile);

        const url = sessionStorage.getItem('apiUrl') + 'data-import/preview';
        this._http.post<any[]>(url, formData).subscribe({
            next: (res) => {
                this.isUploading = false;
                if (res && res.length > 0) {
                    this.previewData = res;
                    this.previewColumns = Object.keys(res[0]);
                } else {
                    this._uiService.showToastr('Warning', 'No records found in the uploaded file.', 'warning');
                }
            },
            error: (err) => {
                this.isUploading = false;
                this._uiService.showToastr('Error', err.error?.message || 'Failed to parse file.', 'error');
            }
        });
    }

    confirmImport(): void {
        if (this.previewData.length === 0) return;

        this.isSaving = true;

        // Map column headers back to exact entity field keys
        const mappedRecords = this.previewData.map(row => {
            const mappedRow: any = {};
            this.columns.forEach(col => {
                // Find matching key in raw excel/csv row headers (case-insensitive & trim)
                const excelKey = Object.keys(row).find(
                    k => k.trim().toLowerCase() === col.header.trim().toLowerCase()
                );
                if (excelKey) {
                    let val = row[excelKey];
                    // Parse values appropriately (e.g. convert active Yes/No to boolean)
                    if (val === 'Yes' || val === 'true' || val === true) {
                        val = true;
                    } else if (val === 'No' || val === 'false' || val === false) {
                        val = false;
                    }
                    mappedRow[col.column] = val;
                }
            });
            return mappedRow;
        });

        const url = sessionStorage.getItem('apiUrl') + 'data-import/save/' + this.entityType;
        this._http.post(url, mappedRecords).subscribe({
            next: () => {
                this.isSaving = false;
                this.dialogRef.close();
                this._uiService.showToastr('Success', `${this.previewData.length} records saved successfully!`, 'success');
                this.onImportComplete.emit();
            },
            error: (err) => {
                this.isSaving = false;
                this._uiService.showToastr('Error', err.error?.message || 'Failed to store records.', 'error');
            }
        });
    }

    closeDialog(): void {
        this.dialogRef.close();
    }
}
