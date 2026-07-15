import { Routes } from '@angular/router';
import { UsersComponent } from "./users.component";
import { UserRoleComponent } from './user-role/user-role.component';
import { ScreensComponent } from './screen-master/screens.component';
import { UserComponent } from './user/user.component';
import { CustomerComponent } from './customer/customer.component';

export default [
    {
        path: '',
        component: UsersComponent,
        children: [
            { path: '', redirectTo: 'staff', pathMatch: 'full' },
            { path: 'staff', component: UserComponent },
            { path: 'customer', component: CustomerComponent },
            { path: 'role-list', component: UserRoleComponent },
            { path: 'screens', component: ScreensComponent },
        ]
    },
] as Routes;
