import {Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {
    FormGroup,
    FormsModule,
    NgForm,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSelectModule} from '@angular/material/select';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {fuseAnimations} from '@fuse/animations';
import {FuseAlertComponent, FuseAlertType} from '@fuse/components/alert';
import {AuthService} from 'app/core/auth/auth.service';
import {DataService} from "../../../data.service";
import {UiService} from "../../../ui.service";

@Component({
    selector: 'auth-sign-in',
    templateUrl: './sign-in.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    standalone: true,
    imports: [
        RouterLink,
        FuseAlertComponent,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatCheckboxModule,
        MatProgressSpinnerModule,
        MatSelectModule,
    ],
})
export class AuthSignInComponent implements OnInit {
    @ViewChild('signInNgForm') signInNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: '',
    };
    signInForm: FormGroup;
    showAlert: boolean = false;
    showCompanySelect: boolean = false;
    userCompanies: any[] = [];
    companyForm: FormGroup;
    loadingConfig: boolean = false;
    hidePassword: boolean = true;

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _authService: AuthService,
        private _formBuilder: UntypedFormBuilder,
        private _router: Router,
        private dataService: DataService,
        private uiService: UiService
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Get remembered user if any
        const rememberedUser = localStorage.getItem('loggedUser') || sessionStorage.getItem('loggedUser') || '';
        const rememberMe = localStorage.getItem('rememberMe') === 'true';

        // Create the form
        this.signInForm = this._formBuilder.group({
            userId: [rememberedUser, Validators.required],
            password: ['', Validators.required],
            rememberMe: [rememberMe],
        });

        // Initialize company select form
        this.companyForm = this._formBuilder.group({
            companyCode: ['', Validators.required]
        });

        // Load tenant details
        this._authService.getTenantDetails().subscribe({
            next: (tenant: any) => {
                if (tenant && tenant.tenantId) {
                    sessionStorage.setItem('tenantId', tenant.tenantId);
                    if (tenant.companyCode) {
                        sessionStorage.setItem('companyCode', tenant.companyCode);
                    }
                }
            },
            error: (err: any) => {
                console.error('Failed to retrieve tenant details', err);
            }
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Sign in
     */
    signIn(): void {
        // Return if the form is invalid
        if (this.signInForm.invalid) {
            return;
        }

        // Disable the form
        this.signInForm.disable();

        // Hide the alert
        this.showAlert = false;

        // Sign in
        const userId = this.signInForm.controls.userId.value;
        const rememberMe = this.signInForm.controls.rememberMe.value;
        
        if (rememberMe) {
            localStorage.setItem('loggedUser', userId);
        } else {
            localStorage.removeItem('loggedUser');
            sessionStorage.setItem('loggedUser', userId);
        }
        this._authService.signIn(this.signInForm.value).subscribe(
            (response: any) => {
                // Check if user is associated with any companies
                const companies = response?.otherMessage?.[0]?.userCompany || [];
                if (companies.length > 1) {
                    this.userCompanies = companies;
                    this.showCompanySelect = true;
                } else if (companies.length === 1) {
                    const selectedCode = companies[0].companyCode;
                    this.loadingConfig = true;

                    this._authService.switchCompany(selectedCode).subscribe({
                        next: () => {
                            this.dataService.loadAppConfig().subscribe({
                                next: () => {
                                    const comp = companies[0];
                                    const compName = comp.companyName || comp.companyCode || 'Default';
                                    this.uiService.infoAlert('Selected Company: ' + compName);
                                    this.proceedToRedirect();
                                },
                                error: (err) => {
                                    console.error('Failed to load app config', err);
                                    this.loadingConfig = false;
                                    this.signInForm.enable();
                                    this.alert = {type: 'error', message: 'Failed to load app configuration. Please try again.'};
                                    this.showAlert = true;
                                }
                            });
                        },
                        error: (err) => {
                            console.error('Failed to switch to default company', err);
                            this.loadingConfig = false;
                            this.signInForm.enable();
                            this.alert = {type: 'error', message: 'Failed to select default company. Please try again.'};
                            this.showAlert = true;
                        }
                    });
                } else {
                    // No company select, just proceed
                    this.proceedToRedirect();
                }
            },
            (response) => {
                // Re-enable the form
                this.signInForm.enable();
                // Reset the form
                this.signInNgForm.resetForm();
                // Set the alert
                this.alert = {type: 'error', message: response?.otherMessage?.[0]?.error || 'Invalid Username or password',};

                // Show the alert
                this.showAlert = true;
            }
        );
    }

    confirmCompanySelection(): void {
        if (this.companyForm.invalid) {
            return;
        }

        this.companyForm.disable();
        this.loadingConfig = true;

        const selectedCode = this.companyForm.controls.companyCode.value;
        const selectedCompany = this.userCompanies.find(c => c.companyCode === selectedCode);
        const compName = selectedCompany ? (selectedCompany.companyName || selectedCompany.companyCode) : selectedCode;

        this._authService.switchCompany(selectedCode).subscribe({
            next: () => {
                this.dataService.loadAppConfig().subscribe({
                    next: () => {
                        this.uiService.infoAlert('Selected Company: ' + compName);
                        this.proceedToRedirect();
                    },
                    error: (err) => {
                        console.error('Failed to load app config', err);
                        this.companyForm.enable();
                        this.loadingConfig = false;
                        this.alert = {type: 'error', message: 'Failed to load app configuration. Please try again.'};
                        this.showAlert = true;
                    }
                });
            },
            error: (err) => {
                console.error('Failed to switch to selected company', err);
                this.companyForm.enable();
                this.loadingConfig = false;
                this.alert = {type: 'error', message: 'Failed to switch to selected company. Please try again.'};
                this.showAlert = true;
            }
        });
    }

    proceedToRedirect(): void {
        const redirectURL =
            this._activatedRoute.snapshot.queryParamMap.get(
                'redirectURL'
            ) || '/signed-in-redirect';
        // Navigate to the redirect url
        this._router.navigateByUrl(redirectURL);
    }
}
