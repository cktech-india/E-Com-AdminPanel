import { Route } from '@angular/router';
import { initialDataResolver } from 'app/app.resolvers';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { NoAuthGuard } from 'app/core/auth/guards/noAuth.guard';
import { LayoutComponent } from 'app/layout/layout.component';
import { FileRepositoryComponent } from './modules/admin/file-repository/file-repository.component';

// @formatter:off
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const appRoutes: Route[] = [

    // Redirect empty path to '/example'
    { path: '', pathMatch: 'full', redirectTo: 'dashboard' },

    // Redirect signed-in user to the '/example'
    //
    // After the user signs in, the sign-in page will redirect the user to the 'signed-in-redirect'
    // path. Below is another redirection for that path to redirect the user to the desired
    // location. This is a small convenience to keep all main routes together here on this file.
    { path: 'signed-in-redirect', pathMatch: 'full', redirectTo: 'dashboard' },

    // Auth routes for guests
    {
        path: '',
        canActivate: [NoAuthGuard],
        canActivateChild: [NoAuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            { path: 'confirmation-required', loadChildren: () => import('app/modules/auth/confirmation-required/confirmation-required.routes') },
            { path: 'forgot-password', loadChildren: () => import('app/modules/auth/forgot-password/forgot-password.routes') },
            { path: 'reset-password', loadChildren: () => import('app/modules/auth/reset-password/reset-password.routes') },
            { path: 'sign-in', loadChildren: () => import('app/modules/auth/sign-in/sign-in.routes') },
            { path: 'sign-up', loadChildren: () => import('app/modules/auth/sign-up/sign-up.routes') }
        ]
    },

    // Auth routes for authenticated users
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            { path: 'sign-out', loadChildren: () => import('app/modules/auth/sign-out/sign-out.routes') },
            { path: 'unlock-session', loadChildren: () => import('app/modules/auth/unlock-session/unlock-session.routes') }
        ]
    },
    // Landing routes
    {
        path: '',
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            { path: 'home', loadChildren: () => import('app/modules/landing/home/home.routes') },
        ]
    },

    // Admin routes
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            { path: 'file-repository', component:FileRepositoryComponent },
            { path: 'sessions', loadComponent: () => import('app/modules/admin/sessions/sessions.component').then(m => m.SessionsComponent) },
            { path: 'dashboard', loadChildren: () => import('app/modules/admin/dashboard/dashboard.routes') },
            { path: 'dashboard/:reportId', loadChildren: () => import('app/modules/admin/dashboard/dashboard.routes') },
            { path: 'user', loadChildren: () => import('app/modules/admin/users/users.routes') },
            { path: 'reports', loadChildren: () => import('app/modules/admin/reports/reports.routes') },
            
            // E-Commerce Routes
            { path: 'products', loadComponent: () => import('app/modules/admin/products/products.component').then(m => m.ProductsComponent) },
            { path: 'categories', loadComponent: () => import('app/modules/admin/categories/categories.component').then(m => m.CategoriesComponent) },
            { path: 'orders', loadComponent: () => import('app/modules/admin/orders/orders.component').then(m => m.OrdersComponent) },
            { path: 'billing', loadComponent: () => import('app/modules/admin/billing/billing.component').then(m => m.BillingComponent) },
            { path: 'inventory', loadComponent: () => import('app/modules/admin/inventory/inventory.component').then(m => m.InventoryComponent) },
            { path: 'discounts', loadComponent: () => import('app/modules/admin/discounts/discounts.component').then(m => m.DiscountsComponent) },
            { path: 'faqs', loadComponent: () => import('app/modules/admin/faqs/faqs.component').then(m => m.FaqsComponent) },
            { path: 'contact-inquiries', loadComponent: () => import('app/modules/admin/contact-inquiries/contact-inquiries.component').then(m => m.ContactInquiriesComponent) },
            { path: 'branches', loadComponent: () => import('app/modules/admin/branches/branches.component').then(m => m.BranchesComponent) },
            { path: 'companies', loadComponent: () => import('app/modules/admin/companies/companies.component').then(m => m.CompaniesComponent) },
            { path: 'tax-config', loadComponent: () => import('app/modules/admin/tax-config/tax-config.component').then(m => m.TaxConfigComponent) },
            { path: 'product-media', loadComponent: () => import('app/modules/admin/product-media/product-media.component').then(m => m.ProductMediaComponent) },
            { path: 'product-group', loadComponent: () => import('app/modules/admin/products/product-group/product-group.component').then(m => m.ProductGroupComponent) },
            { path: 'product-recommended', loadComponent: () => import('app/modules/admin/products/product-recommended/product-recommended.component').then(m => m.ProductRecommendedComponent) },
            { path: 'product-reviews', loadComponent: () => import('app/modules/admin/products/product-reviews/product-reviews.component').then(m => m.ProductReviewsComponent) },
            { path: 'home-config', loadComponent: () => import('app/modules/admin/home-config/home-config.component').then(m => m.HomeConfigComponent) },
            { path: 'seo-config', loadComponent: () => import('app/modules/admin/seo-config/seo-config.component').then(m => m.SeoConfigComponent) },
            { path: 'stock-logs', loadComponent: () => import('app/modules/admin/inventory/stock-logs/stock-logs.component').then(m => m.StockLogsComponent) },
            { path: 'carts', loadComponent: () => import('app/modules/admin/orders/carts/carts.component').then(m => m.CartsComponent) },
            { path: 'wishlists', loadComponent: () => import('app/modules/admin/discounts/wishlists/wishlists.component').then(m => m.WishlistsComponent) },
        ]
    }
];

