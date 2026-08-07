import { Component, OnInit, AfterViewInit, ViewChild, TemplateRef, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';

// Table and services
import { CkTable, FuseAlertComponent } from '@fuse/components/table-grid/table-grid.component';
import { UiService } from '@services/ui.service';
import { DataService } from '@services/data.service';
import { EcommerceService } from '../ecommerce.service';

@Component({
  selector: 'app-notification-config',
  templateUrl: './notification-config.component.html',
  styleUrls: ['./notification-config.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonToggleModule,
    MatIconModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    MatTabsModule,
    FuseAlertComponent
  ]
})
export class NotificationConfigComponent implements OnInit, AfterViewInit {
  originalGridData: any[] = [];
  selectedType = 'ALL';
  currentEditingRow: any = null;
  editFormErrors: { [key: string]: string } = {};
  dialogRef: any = null;
  lastFocusedField: 'subject' | 'messageContent' = 'messageContent';
  lastCursorPosition = 0;

  readonly systemParamsPlaceholder = '{ "bodySequence": [] }';
  readonly defaultInputsPlaceholder = '{ "mobile": "" }';

  table!: CkTable;
  logTable!: CkTable;

  @ViewChild('notificationStatusTpl') notificationStatusTpl!: TemplateRef<any>;
  @ViewChild('notificationTestTpl') notificationTestTpl!: TemplateRef<any>;

  constructor(
    private _ecommerceService: EcommerceService,
    public uiService: UiService,
    public _dataService: DataService,
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    this.initializeTable();
    this.loadNotifications();
    this.loadLogs();
  }

  ngAfterViewInit() {
    const testCol = this.table.columns.find(c => c.column === 'testNotification');
    if (testCol) {
      testCol.template = this.notificationTestTpl;
    }
    
    const statusCol = this.table.columns.find(c => c.column === 'activeStatus');
    if (statusCol) {
      statusCol.template = this.notificationStatusTpl;
    }

    this.table = { ...this.table };
  }

  initializeTable() {
    // Templates table configuration
    this.table = {
      gridData: [],
      columns: [
        {
          header: 'Notification Type',
          column: 'notifyChannel',
          width: '10%',
          formatter: (v) => {
            const type = v ? v : 'SMS';
            let colorClass = '';
            if (type === 'WHATSAPP') {
              colorClass = 'badge-whatsapp';
            } else if (type === 'SMS') {
              colorClass = 'badge-sms';
            } else if (type === 'EMAIL') {
              colorClass = 'badge-email';
            } else if (type === 'PUSH') {
              colorClass = 'badge-push';
            }
            return `<span class="badge-type ${colorClass}">${type}</span>`;
          }
        },
        {
          header: 'Notification Name',
          column: 'notificationName',
          width: '20%'
        },
        {
          header: 'Subject / Title',
          column: 'subject',
          width: '20%',
          formatter: (v) => `<span>${v ? v : '-'}</span>`
        },
        {
          header: 'Notification Content',
          column: 'messageContent',
          width: '35%',
          formatter: (v) =>
             `<span title="${v || ''}">${
              v && v.length > 70
                ? `${v.substring(0, 70)}...`
                : (v || '')
            }</span>`
        },
        {
          header: 'Test Notification',
          column: 'testNotification',
          width: '28%',
          template: this.notificationTestTpl
        },
        {
          header: 'Status',
          column: 'activeStatus',
          width: '10%',
          template: this.notificationStatusTpl
        }
      ],
      actions: [], // Removed edit/delete CRUD
      isShowFilter: false,
      loading: false
    };

    // Logs table configuration
    this.logTable = {
      gridData: [],
      columns: [
        {
          header: 'Sent Time',
          column: 'sentAt',
          width: '15%',
          formatter: (v) => v ? new Date(v).toLocaleString() : 'N/A'
        },
        {
          header: 'Notification Code',
          column: 'notificationCode',
          width: '15%'
        },
        {
          header: 'Channel Type',
          column: 'channelType',
          width: '10%',
          formatter: (v) => {
            const type = v ? v : 'SMS';
            let colorClass = '';
            if (type === 'WHATSAPP') {
              colorClass = 'badge-whatsapp';
            } else if (type === 'SMS') {
              colorClass = 'badge-sms';
            } else if (type === 'EMAIL') {
              colorClass = 'badge-email';
            } else if (type === 'PUSH') {
              colorClass = 'badge-push';
            }
            return `<span class="badge-type ${colorClass}">${type}</span>`;
          }
        },
        {
          header: 'Recipient',
          column: 'recipient',
          width: '15%',
          formatter: (v) => `<strong>${v || '-'}</strong>`
        },
        {
          header: 'Subject / Title',
          column: 'subject',
          width: '15%',
          formatter: (v) => `<span>${v ? v : '-'}</span>`
        },
        {
          header: 'Sent Status',
          column: 'status',
          width: '10%',
          formatter: (v) => {
            const status = v || 'F';
            const isSuccess = status === 'D' || status === 'S';
            const badgeClass = isSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
            const statusText = isSuccess ? 'SUCCESS' : 'FAILED';
            return `<span class="px-2 py-1 rounded-full text-xs font-semibold ${badgeClass}">${statusText}</span>`;
          }
        },
        {
          header: 'API Response / Error message',
          column: 'message',
          width: '20%',
          formatter: (v) => `<span class="text-xs text-slate-500" title="${v || ''}">${v && v.length > 50 ? v.substring(0, 50) + '...' : (v || '-')}</span>`
        }
      ],
      isShowFilter: true,
      loading: false
    };
  }

  loadNotifications() {
    this.table.loading = true;
    this.table = { ...this.table };
    this._ecommerceService.getNotificationList().subscribe({
      next: (e: any[]) => {
        this.originalGridData = e.map(item => ({
          ...item,
          mobile: '', // add mobile field for each row
          sendTo: '', // input text bound to row.sendTo
        }));
        this.filterGridData();
        this.table.loading = false;
        this.table = { ...this.table };
      },
      error: () => {
        this.uiService.errorAlert('Failed to load notification templates.');
        this.table.loading = false;
        this.table = { ...this.table };
      }
    });
  }

  loadLogs() {
    this.logTable.loading = true;
    this.logTable = { ...this.logTable };
    this._ecommerceService.getNotificationLogs().subscribe({
      next: (res: any[]) => {
        this.logTable.gridData = res || [];
        this.logTable.loading = false;
        this.logTable = { ...this.logTable };
      },
      error: () => {
        this.uiService.errorAlert('Failed to load notification logs.');
        this.logTable.loading = false;
        this.logTable = { ...this.logTable };
      }
    });
  }

  filterGridData() {
    if (this.selectedType === 'ALL') {
      this.table.gridData = this.originalGridData;
    } else {
      this.table.gridData = this.originalGridData.filter(
        item => item.notifyChannel === this.selectedType
      );
    }
    this.table = { ...this.table };
  }

  sendTestSMS(data: any) {
    if (!data.sendTo || !data.sendTo.trim()) {
      this.uiService.errorAlert('Please enter a recipient (Mobile or Email) to test.');
      return;
    }

    let input: any = {};
    if (data.defaultInputs) {
      try {
        input = JSON.parse(data.defaultInputs);
      } catch (e) {
        console.error('Failed to parse default inputs', e);
      }
    }
    input.mobile = data.sendTo;
    input.email = data.sendTo;
    input.emailTo = data.sendTo;

    this.table.loading = true;
    this.table = { ...this.table };
    this._ecommerceService.triggerNotification(data.notificationCode, data.notifyChannel, input).subscribe({
      next: (res) => {
        this.table.loading = false;
        this.table = { ...this.table };
        if (res && (res.status === 'SUCCESS' || res.status === 'S')) {
          this.uiService.successAlert('Test notification triggered successfully!');
        } else {
          this.uiService.errorAlert(res && res.message ? res.message : 'Failed to send test notification.');
        }
        // Reload logs to reflect the new test send immediately
        this.loadLogs();
      },
      error: (err) => {
        this.table.loading = false;
        this.table = { ...this.table };
        this.uiService.errorAlert('Error sending test notification.');
        this.loadLogs();
      }
    });
  }

  updateSMSDetails(data: any) {
    this._ecommerceService.updateNotificationDetails(data).subscribe({
      next: () => {
        this.uiService.successAlert(`Notification Template status updated successfully.`);
        this.loadNotifications();
      },
      error: () => {
        this.uiService.errorAlert('Failed to update status.');
        this.loadNotifications();
      }
    });
  }

  onTabChange(event: any) {
    if (event.index === 1) {
      this.loadLogs();
    } else if (event.index === 0) {
      this.loadNotifications();
    }
  }
}
