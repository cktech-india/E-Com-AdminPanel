import {Routes} from '@angular/router';
import {UsersComponent} from "./users.component";
import { UserRoleComponent } from './user-role/user-role.component';
import { ScreensComponent } from './screen-master/screens.component';
import { UserComponent } from './user/user.component';

export default [
    {
        path: '',
        component: UsersComponent,
        children: [
            { path: '', redirectTo: 'user-list', pathMatch: 'full' },
            { path: 'user-list', component: UserComponent },
            { path: 'role-list', component: UserRoleComponent },
            { path: 'screens', component: ScreensComponent },
        ]
    },
] as Routes;
