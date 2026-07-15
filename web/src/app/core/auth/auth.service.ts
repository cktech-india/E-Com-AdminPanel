import {HttpClient} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {AuthUtils} from 'app/core/auth/auth.utils';
import {UserService} from 'app/core/user/user.service';
import {catchError, Observable, of, switchMap, throwError} from 'rxjs';
import {DataService} from "../../data.service";
import {User} from "../user/user.types";

export const MOCK_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjIwMDAwMDAwMDAsInN1YiI6ImRlbW8iLCJpYXQiOjE1MDAwMDAwMDB9.ZHVtbXlfc2lnbmF0dXJl';

@Injectable({providedIn: 'root'})
export class AuthService {
    private _authenticated: boolean = false;
    appConfig: any = {};
    private _httpClient = inject(HttpClient);
    private _userService = inject(UserService);
      currentUser: any = {};
    selectedCompany: any = {companyCode: 'CKT'};

    constructor(private dataService: DataService) {
        if (sessionStorage.getItem('selectedCompany')) {
            this.selectedCompany.companyCode = sessionStorage.getItem('selectedCompany');
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for access token
     */
    set accessToken(token: string) {
        // Store in whichever storage is being used
        if (localStorage.getItem('rememberMe') === 'true') {
            localStorage.setItem('accessToken', token);
        }
        sessionStorage.setItem('accessToken', token);
    }

    get accessToken(): string {
        return sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken') || '';
    }

    isUserLoggedIn() {
        return this.currentUser != null;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Forgot password
     *
     * @param email
     */
    forgotPassword(email: string): Observable<any> {
        return this._httpClient.post('api/auth/forgot-password', email);
    }

    /**
     * Reset password
     *
     * @param password
     */
    resetPassword(password: string): Observable<any> {
        return this._httpClient.post('api/auth/reset-password', password);
    }

    signIn(credentials: any): Observable<any> {
        // Throw error, if the user is already logged in
        if (this._authenticated) {
            return throwError('User is already logged in.');
        }

        if (credentials.userId === 'demo' && credentials.password === 'demo') {
            const demoUser: User = {
                id: 'demo-id',
                name: 'Demo Admin User',
                email: 'demo@sinjaymart.com',
                avatar: 'images/avatars/brian-hughes.jpg',
                status: 'active',
                userId: 'demo',
                firstName: 'Demo',
                lastName: 'Admin',
                phone: '1234567890',
                token: MOCK_JWT,
                groupCode: 'AdminGrp',
                screenList: [],
                isPasswordForceChange: false,
                userImage: 'images/avatars/brian-hughes.jpg',
                loginMessage: 'SUCCESS',
                loginStatus: 'SUCCESS',
                currentAttemptCount: 0,
                otherMessage: ''
            };
            const demoResponse = {
                status: 'SUCCESS',
                otherMessage: [
                    {
                        token: MOCK_JWT,
                        groupCode: 'AdminGrp',
                        companyCode: 'COMP1',
                        userCompany: [
                            {
                                companyCode: 'COMP1',
                                companyName: 'Demo Store Company'
                            }
                        ]
                    }
                ]
            };
            this.accessToken = MOCK_JWT;
            this._authenticated = true;
            this._userService.user = demoUser;
            this.currentUser = demoUser;
            
            sessionStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            sessionStorage.setItem('accessToken', this.accessToken);
            sessionStorage.setItem('selectedCompany', 'COMP1');
            return of(demoResponse);
        }

        return this._httpClient.post(this.dataService.authUrl + 'login', credentials).pipe(
            switchMap((response: any) => {
                if (response.status === 'SUCCESS') {
                    response.avatar = 'images/avatars/brian-hughes.jpg';
                    this.accessToken = response.otherMessage[0].token;
                    this._authenticated = true;
                    this._userService.user = response.otherMessage[0];
                    this.currentUser = response.otherMessage[0];
                    
                    // Handle Remember Me
                    if (credentials.rememberMe) {
                        localStorage.setItem('rememberMe', 'true');
                        localStorage.setItem('accessToken', this.accessToken);
                        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                    } else {
                        localStorage.removeItem('rememberMe');
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('currentUser');
                    }
                    sessionStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                } else {
                    return throwError(response);
                }
                // Return a new observable with the response
                return of(response);
            })
        );
    }

    /**
     * Sign in using the access token
     */
    signInUsingToken(): Observable<any> {
        // Sign in using the token
        return this._httpClient
            .post('api/auth/sign-in-with-token', {
                accessToken: this.accessToken,
            })
            .pipe(
                catchError(() =>
                    // Return false
                    of(false)
                ),
                switchMap((response: any) => {
                    if (response.accessToken) {
                        this.accessToken = response.accessToken;
                    }
                    this._authenticated = true;
                    this._userService.user = response;
                    // Return true
                    return of(true);
                })
            );
    }

    /**
     * Sign out
     */
    signOut(): Observable<any> {
        // Remove the access token from both storages
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('currentUser');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('rememberMe');

        // Set the authenticated flag to false
        this._authenticated = false;

        // Return the observable
        return of(true);
    }

    /**
     * Sign up
     *
     * @param user
     */
    signUp(user: {
        name: string;
        email: string;
        password: string;
        company: string;
    }): Observable<any> {
        return this._httpClient.post('api/auth/sign-up', user);
    }

    /**
     * Unlock session
     *
     * @param credentials
     */
    unlockSession(credentials: {
        email: string;
        password: string;
    }): Observable<any> {
        return this._httpClient.post('api/auth/unlock-session', credentials);
    }

    /**
     * Check the authentication status
     */
    check(): Observable<boolean> {
        // Check the access token availability
        const token = this.accessToken;
        if (!token) {
            return of(false);
        }

        // Check the access token expire date
        if (AuthUtils.isTokenExpired(token)) {
            this.signOut();
            return of(false);
        }

        // Try to recover user from storage if not in memory
        if (!this.currentUser || Object.keys(this.currentUser).length === 0) {
            const storedUser = sessionStorage.getItem('currentUser') || localStorage.getItem('currentUser');
            if (storedUser) {
                const user = JSON.parse(storedUser);
                this._userService.user = user;
                this.currentUser = user;
                sessionStorage.setItem('currentUser', JSON.stringify(user));
                sessionStorage.setItem('accessToken', user.token);
            } else {
                // If no user info but we have a token, we might need to fetch user info
                // or just fail if user info is required for the app to function
                return of(false);
            }
        }

        this._authenticated = true;
        return of(true);
    }

    getMenu(): Observable<any> {
        // https://app.cktechindia.com/api/entity/access/user-group-privilege/AdminGrp
        return this._httpClient.get(this.dataService.apiUrl + 'entity/access/user-group-privilege/' + this.currentUser.groupCode);
    }

    getTenantDetails(): Observable<any> {
        return this._httpClient.get(this.dataService.authUrl + 'tenant-details');
    }

    /**
     * Switch the active company for the current session.
     * Inactivates the existing JWT on the backend and issues a new one
     * with the selected companyCode embedded in its claims.
     * The new token is stored in sessionStorage (and localStorage if rememberMe is set).
     *
     * @param companyCode  the company code to switch to
     */
    switchCompany(companyCode: string): Observable<any> {
        if (this.accessToken === MOCK_JWT) {
            this.selectedCompany.companyCode = companyCode;
            this.currentUser = { ...this.currentUser, companyCode, token: MOCK_JWT };
            sessionStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            sessionStorage.setItem('selectedCompany', companyCode);
            if (localStorage.getItem('rememberMe') === 'true') {
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            }
            return of({ status: 'SUCCESS', otherMessage: [{ token: MOCK_JWT }] });
        }

        return this._httpClient
            .post(this.dataService.authUrl + 'switch-company', { companyCode })
            .pipe(
                switchMap((response: any) => {
                    if (response.status === 'SUCCESS') {
                        const newToken: string = response.otherMessage[0].token;

                        // Store new token
                        this.accessToken = newToken;

                        // Update currentUser companyCode in memory and storage
                        this.selectedCompany.companyCode = companyCode;
                        this.currentUser = { ...this.currentUser, companyCode, token: newToken };
                        sessionStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                        sessionStorage.setItem('selectedCompany', companyCode);

                        if (localStorage.getItem('rememberMe') === 'true') {
                            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                        }
                    } else {
                        return throwError(() => response);
                    }
                    return of(response);
                })
            );
    }
}
