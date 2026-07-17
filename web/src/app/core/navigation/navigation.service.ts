import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Navigation } from 'app/core/navigation/navigation.types';
import { Observable, ReplaySubject, tap, of } from 'rxjs';
import { AuthService } from "../auth/auth.service";

const ecomNavigation = [
    {
        id: 'dashboard',
        title: 'Dashboard',
        type: 'basic',
        icon: 'heroicons_outline:chart-bar',
        link: '/dashboard'
    },
    {
        id: 'catalog',
        title: 'Catalog',
        type: 'collapsable',
        icon: 'heroicons_outline:shopping-bag',
        children: [
            {
                id: 'products',
                title: 'Products',
                type: 'basic',
                icon: 'heroicons_outline:tag',
                link: '/products'
            },
            {
                id: 'categories',
                title: 'Categories',
                type: 'basic',
                icon: 'heroicons_outline:squares-2x2',
                link: '/categories'
            },
            {
                id: 'product-media',
                title: 'Product Media',
                type: 'basic',
                icon: 'heroicons_outline:photo',
                link: '/product-media'
            },
            {
                id: 'product-group',
                title: 'Product Grouping',
                type: 'basic',
                icon: 'heroicons_outline:rectangle-stack',
                link: '/product-group'
            },
            {
                id: 'product-recommended',
                title: 'Product Recommended',
                type: 'basic',
                icon: 'heroicons_outline:star',
                link: '/product-recommended'
            },
            {
                id: 'product-reviews',
                title: 'Product Reviews',
                type: 'basic',
                icon: 'heroicons_outline:chat-bubble-bottom-center-text',
                link: '/product-reviews'
            }
        ]
    },
    {
        id: 'sales',
        title: 'Sales',
        type: 'collapsable',
        icon: 'heroicons_outline:currency-dollar',
        children: [
            {
                id: 'orders',
                title: 'Orders',
                type: 'basic',
                icon: 'heroicons_outline:document-text',
                link: '/orders'
            },
            {
                id: 'carts',
                title: 'Active Carts',
                type: 'basic',
                icon: 'heroicons_outline:shopping-cart',
                link: '/carts'
            },
            {
                id: 'billing',
                title: 'Billing & Invoices',
                type: 'basic',
                icon: 'heroicons_outline:receipt-percent',
                link: '/billing'
            }
        ]
    },
    {
        id: 'logistics',
        title: 'Logistics',
        type: 'collapsable',
        icon: 'heroicons_outline:truck',
        children: [
            {
                id: 'inventory',
                title: 'Inventory Levels',
                type: 'basic',
                icon: 'heroicons_outline:archive-box',
                link: '/inventory'
            },
            {
                id: 'stock-logs',
                title: 'Stock Logs',
                type: 'basic',
                icon: 'heroicons_outline:clipboard-document-list',
                link: '/stock-logs'
            }
        ]
    },
    {
        id: 'marketing',
        title: 'Marketing',
        type: 'collapsable',
        icon: 'heroicons_outline:megaphone',
        children: [
            {
                id: 'discounts',
                title: 'Discounts & Promos',
                type: 'basic',
                icon: 'heroicons_outline:gift',
                link: '/discounts'
            },
            {
                id: 'wishlists',
                title: 'Wishlists',
                type: 'basic',
                icon: 'heroicons_outline:heart',
                link: '/wishlists'
            },
            {
                id: 'seo-config',
                title: 'SEO Optimizer',
                type: 'basic',
                icon: 'heroicons_outline:globe-alt',
                link: '/seo-config'
            }
        ]
    },
    {
        id: 'support',
        title: 'Customer Support',
        type: 'collapsable',
        icon: 'heroicons_outline:chat-bubble-left-right',
        children: [
            {
                id: 'contact-inquiries',
                title: 'Contact Inquiries',
                type: 'basic',
                icon: 'heroicons_outline:envelope-open',
                link: '/contact-inquiries'
            },
            {
                id: 'faqs',
                title: 'FAQ Directory',
                type: 'basic',
                icon: 'heroicons_outline:question-mark-circle',
                link: '/faqs'
            }
        ]
    },
    {
        id: 'administration',
        title: 'Administration',
        type: 'collapsable',
        icon: 'heroicons_outline:users',
        children: [
            {
                id: 'staff-list',
                title: 'Staff Directory',
                type: 'basic',
                icon: 'heroicons_outline:user-group',
                link: '/user/staff'
            },
            {
                id: 'customer-list',
                title: 'Customer Directory',
                type: 'basic',
                icon: 'heroicons_outline:identification',
                link: '/user/customer'
            },
            {
                id: 'role-list',
                title: 'User Roles',
                type: 'basic',
                icon: 'heroicons_outline:shield-check',
                link: '/user/role-list'
            },
            {
                id: 'branches',
                title: 'Branches',
                type: 'basic',
                icon: 'heroicons_outline:building-office-2',
                link: '/branches'
            },
            {
                id: 'companies',
                title: 'Companies (Tenants)',
                type: 'basic',
                icon: 'heroicons_outline:building-storefront',
                link: '/companies'
            }
        ]
    },
    {
        id: 'settings',
        title: 'Settings',
        type: 'collapsable',
        icon: 'heroicons_outline:cog-6-tooth',
        children: [
            {
                id: 'tax-config',
                title: 'Tax Configuration',
                type: 'basic',
                icon: 'heroicons_outline:adjustments-horizontal',
                link: '/tax-config'
            },
            {
                id: 'home-config',
                title: 'Homepage Config',
                type: 'basic',
                icon: 'heroicons_outline:home',
                link: '/home-config'
            }
        ]
    },
    {
        id: 'reports',
        title: 'Reports',
        type: 'basic',
        icon: 'heroicons_outline:chat-bubble-bottom-center-text',
        link: '/reports'
    }
];

@Injectable({ providedIn: 'root' })
export class NavigationService {
    private _httpClient = inject(HttpClient);
    private _navigation: ReplaySubject<Navigation> =
        new ReplaySubject<Navigation>(1);

    constructor(private _auth: AuthService) {
    }

    get navigation$(): Observable<Navigation> {
        return this._navigation.asObservable();
    }

    get(): Observable<Navigation> {
        const tempNav = {};
        ['compact', 'default', 'futuristic', 'horizontal'].forEach(e => {
            tempNav[e] = ecomNavigation;
        });
        this._navigation.next(<Navigation>tempNav);
        return of(<Navigation>tempNav);
    }
}
