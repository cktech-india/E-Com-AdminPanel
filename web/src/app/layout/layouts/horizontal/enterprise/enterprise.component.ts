import { Component, OnDestroy, OnInit, ViewEncapsulation, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { FuseFullscreenComponent } from '@fuse/components/fullscreen';
import { FuseLoadingBarComponent } from '@fuse/components/loading-bar';
import {
    FuseHorizontalNavigationComponent,
    FuseNavigationService,
    FuseVerticalNavigationComponent,
} from '@fuse/components/navigation';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { NavigationService } from 'app/core/navigation/navigation.service';
import { Navigation } from 'app/core/navigation/navigation.types';
import { LanguagesComponent } from 'app/layout/common/languages/languages.component';
import { MessagesComponent } from 'app/layout/common/messages/messages.component';
import { NotificationsComponent } from 'app/layout/common/notifications/notifications.component';
import { QuickChatComponent } from 'app/layout/common/quick-chat/quick-chat.component';
import { SearchComponent } from 'app/layout/common/search/search.component';
import { ShortcutsComponent } from 'app/layout/common/shortcuts/shortcuts.component';
import { UserComponent } from 'app/layout/common/user/user.component';
import { Subject, takeUntil, Observable } from 'rxjs';
import { MatSelect, MatOption } from "@angular/material/select";
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '@services/core/auth/auth.service';
import { FontSizeService } from 'app/core/font-size/font-size.service';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DataService } from 'app/data.service';

@Component({
    selector: 'enterprise-layout',
    templateUrl: './enterprise.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        FuseLoadingBarComponent,
        FuseVerticalNavigationComponent,
        MatButtonModule,
        MatIconModule,
        LanguagesComponent,
        FuseFullscreenComponent,
        SearchComponent,
        ShortcutsComponent,
        MessagesComponent,
        NotificationsComponent,
        UserComponent,
        FuseHorizontalNavigationComponent,
        RouterOutlet,
        QuickChatComponent,
        MatSelect,
        MatOption,
        ReactiveFormsModule,
        CommonModule,
        MatTooltipModule
    ],
})
export class EnterpriseLayoutComponent implements OnInit, OnDestroy {

    isScreenSmall: boolean;
    navigation: Navigation;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    companyData: any = [];
    selectedCompany: FormControl = new FormControl();
    currentFontSize$: Observable<string>;
    private _httpClient = inject(HttpClient);
    private _dataService = inject(DataService);

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _navigationService: NavigationService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _fuseNavigationService: FuseNavigationService,
        private auth: AuthService,
        private _fontSizeService: FontSizeService
    ) {
        this.currentFontSize$ = this._fontSizeService.fontSize$;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for current year
     */
    get currentYear(): number {
        return new Date().getFullYear();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Subscribe to navigation data
        this._navigationService.navigation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((navigation: Navigation) => {
                this.navigation = navigation;
            });
        this.companyData = [];
        this._httpClient.get<any[]>(this._dataService.apiUrl + 'companies/list').subscribe({
            next: (res) => {
                this.companyData = res || [];
            },
            error: () => {
                this.companyData = this.auth?.currentUser?.userCompany || [];
            }
        });
        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({ matchingAliases }) => {
                // Check if the screen is small
                this.isScreenSmall = !matchingAliases.includes('md');
            });

        // Set initial company
        this.selectedCompany.setValue(this.auth.selectedCompany.companyCode, { emitEvent: false });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
    onCompanyChange(event: any): void {
        const previousCode = this.auth.selectedCompany.companyCode;
        // Optimistically update the form control; will revert on error
        this.auth.switchCompany(event.value).subscribe({
            next: () => {
                window.location.reload();
            },
            error: (err) => {
                console.error('Company switch failed, reverting selection', err);
                // Revert the mat-select to the previous value without emitting another event
                this.selectedCompany.setValue(previousCode, { emitEvent: false });
            }
        });
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Toggle navigation
     *
     * @param name
     */
    toggleNavigation(name: string): void {
        // Get the navigation
        const navigation =
            this._fuseNavigationService.getComponent<FuseVerticalNavigationComponent>(
                name
            );

        if (navigation) {
            // Toggle the opened status
            navigation.toggle();
        }
    }

    increaseFontSize(): void {
        this._fontSizeService.increase();
    }

    decreaseFontSize(): void {
        this._fontSizeService.decrease();
    }
}
