import {Component, ViewEncapsulation} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {RouterOutlet} from '@angular/router';

@Component({
    selector: 'user',
    templateUrl: './users.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [MatButtonModule, MatIconModule, RouterOutlet],
})
export class UsersComponent {

    /**
     * Constructor
     */
    constructor() {
    }
}
