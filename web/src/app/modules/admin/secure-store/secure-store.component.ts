import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EcommerceService } from '../ecommerce.service';
import { UiService } from '@services/ui.service';

@Component({
    selector: 'app-secure-store',
    standalone: true,
    imports: [
        CommonModule, FormsModule, ReactiveFormsModule,
        MatButtonModule, MatCardModule, MatFormFieldModule,
        MatInputModule, MatSelectModule, MatIconModule,
        MatDialogModule, MatTooltipModule
    ],
    templateUrl: './secure-store.component.html'
})
export class SecureStoreComponent implements OnInit {

    @ViewChild('editDialogTpl') editDialogTpl!: TemplateRef<any>;
    @ViewChild('cashfreeDialogTpl') cashfreeDialogTpl!: TemplateRef<any>;

    configs: any[] = [];
    filteredConfigs: any[] = [];
    loading = false;

    groupTypes: string[] = ['ALL', 'PAYMENT_GATEWAY', 'SMS_GATEWAY', 'EMAIL_GATEWAY'];
    groupNames: string[] = ['ALL', 'CASHFREE', 'RAZORPAY', 'STRIPE', 'FEDERAL_BANK'];

    selectedGroupTypeControl = new FormControl('ALL');
    selectedGroupNameControl = new FormControl('ALL');
    searchControl = new FormControl('');

    // Modal state
    private dialogRef!: MatDialogRef<any>;
    editingConfig: any = {
        configCode: '',
        configValue: '',
        groupName: 'CASHFREE',
        groupType: 'PAYMENT_GATEWAY'
    };
    isNew = true;

    // Quick Cashfree setup form state
    cashfreeData = {
        appId: '',
        secretKey: '',
        env: 'SANDBOX'
    };

    constructor(
        private ecomService: EcommerceService,
        protected uiService: UiService,
        private dialog: MatDialog
    ) {
        this.selectedGroupTypeControl.valueChanges.subscribe(() => this.applyFilter());
        this.selectedGroupNameControl.valueChanges.subscribe(() => this.applyFilter());
        this.searchControl.valueChanges.subscribe(() => this.applyFilter());
    }

    ngOnInit(): void {
        this.loadConfigs();
    }

    loadConfigs(): void {
        this.loading = true;
        this.ecomService.getSecureStoreConfigs().subscribe({
            next: (data) => {
                this.configs = data || [];
                this.applyFilter();
                this.loading = false;
            },
            error: (err) => {
                console.error(err);
                this.loading = false;
            }
        });
    }

    applyFilter(): void {
        const type = this.selectedGroupTypeControl.value;
        const name = this.selectedGroupNameControl.value;
        const search = (this.searchControl.value || '').toLowerCase().trim();

        this.filteredConfigs = this.configs.filter(item => {
            const matchType = (type === 'ALL' || !type) ? true : item.groupType === type;
            const matchName = (name === 'ALL' || !name) ? true : item.groupName === name;
            const matchSearch = !search ? true :
                (item.configCode || '').toLowerCase().includes(search) ||
                (item.groupName || '').toLowerCase().includes(search) ||
                (item.groupType || '').toLowerCase().includes(search);
            return matchType && matchName && matchSearch;
        });
    }

    openAddDialog(): void {
        this.isNew = true;
        this.editingConfig = {
            configCode: '',
            configValue: '',
            groupName: 'CASHFREE',
            groupType: 'PAYMENT_GATEWAY'
        };
        this.dialogRef = this.dialog.open(this.editDialogTpl, { width: '500px' });
    }

    openEditDialog(row: any): void {
        this.isNew = false;
        this.editingConfig = {
            configCode: row.configCode,
            configValue: row.configValue || '',
            groupName: row.groupName || 'CASHFREE',
            groupType: row.groupType || 'PAYMENT_GATEWAY'
        };
        this.dialogRef = this.dialog.open(this.editDialogTpl, { width: '500px' });
    }

    saveConfig(): void {
        if (!this.editingConfig.configCode || !this.editingConfig.configValue) {
            return;
        }
        this.ecomService.saveSecureStoreConfig(this.editingConfig).subscribe({
            next: () => {
                if (this.dialogRef) this.dialogRef.close();
                this.loadConfigs();
            },
            error: (err) => console.error(err)
        });
    }

    deleteConfig(configCode: string): void {
        if (confirm(`Are you sure you want to delete credential '${configCode}'?`)) {
            this.ecomService.deleteSecureStoreConfig(configCode).subscribe({
                next: () => this.loadConfigs(),
                error: (err) => console.error(err)
            });
        }
    }

    openCashfreeSetupDialog(): void {
        // Pre-fill existing Cashfree values if available
        const appIdConfig = this.configs.find(c => c.configCode === 'CASHFREE_APP_ID');
        const secretConfig = this.configs.find(c => c.configCode === 'CASHFREE_SECRET');
        const envConfig = this.configs.find(c => c.configCode === 'CASHFREE_ENV');

        this.cashfreeData = {
            appId: appIdConfig ? appIdConfig.configValue : '',
            secretKey: secretConfig ? secretConfig.configValue : '',
            env: envConfig ? envConfig.configValue : 'SANDBOX'
        };

        this.dialogRef = this.dialog.open(this.cashfreeDialogTpl, { width: '550px' });
    }

    saveCashfreeSetup(): void {
        if (!this.cashfreeData.appId || !this.cashfreeData.secretKey) {
            alert('Please enter both Cashfree App ID and Secret Key.');
            return;
        }

        const appConfig = {
            configCode: 'CASHFREE_APP_ID',
            configValue: this.cashfreeData.appId,
            groupName: 'CASHFREE',
            groupType: 'PAYMENT_GATEWAY'
        };

        const secretConfig = {
            configCode: 'CASHFREE_SECRET',
            configValue: this.cashfreeData.secretKey,
            groupName: 'CASHFREE',
            groupType: 'PAYMENT_GATEWAY'
        };

        const envConfig = {
            configCode: 'CASHFREE_ENV',
            configValue: this.cashfreeData.env,
            groupName: 'CASHFREE',
            groupType: 'PAYMENT_GATEWAY'
        };

        this.ecomService.saveSecureStoreConfig(appConfig).subscribe(() => {
            this.ecomService.saveSecureStoreConfig(secretConfig).subscribe(() => {
                this.ecomService.saveSecureStoreConfig(envConfig).subscribe(() => {
                    if (this.dialogRef) this.dialogRef.close();
                    this.loadConfigs();
                });
            });
        });
    }

    closeDialog(): void {
        if (this.dialogRef) this.dialogRef.close();
    }
}
