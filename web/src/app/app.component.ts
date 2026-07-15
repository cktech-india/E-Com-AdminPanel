import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: true,
    imports: [RouterOutlet],
})
export class AppComponent {
    /**
     * Constructor
     */
    constructor() {
        const lastUrl = sessionStorage.getItem('lastFailedRequestUrl');
        const lastStatus = sessionStorage.getItem('lastFailedRequestStatus');
        if (lastUrl) {
            console.error(
                `%c [ALARM] The page was refreshed because a request to: "${lastUrl}" failed with status: ${lastStatus} %c`,
                'background: #ff0000; color: #ffffff; font-size: 16px; font-weight: bold; padding: 4px;',
                ''
            );
            sessionStorage.removeItem('lastFailedRequestUrl');
            sessionStorage.removeItem('lastFailedRequestStatus');
        }
    }
}
