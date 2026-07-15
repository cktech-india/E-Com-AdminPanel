/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';
// Menus
export const defaultNavigation: FuseNavigationItem[] = [
    {
        id: 'Contract-Mgm',
        title: 'Contract',
        type: 'collapsable',
        icon: 'heroicons_outline:cog',
        children: [
            {
                id: 'Contract',
                title: 'Contract',
                type: 'basic',
                icon: 'heroicons_outline:chart-pie',
                link: '/contract/contract-list'
            }, {
                id: 'Product-Approval',
                title: 'Product Approval',
                type: 'basic',
                icon: 'heroicons_outline:check-circle',
                link: '/contract/contract-approval/P'
            }, {
                id: 'Finance-Approval',
                title: 'Finance Approval',
                type: 'basic',
                icon: 'heroicons_outline:check-circle',
                link: '/contract/contract-approval/PA'
            }, {
                id: 'Admin-Approval',
                title: 'Admin Approval',
                type: 'basic',
                icon: 'heroicons_outline:clock',
                link: '/contract/contract-approval/FA'
            }]
    },
    {
        id: 'Configuration',
        title: 'Configuration',
        type: 'collapsable',
        icon: 'heroicons_outline:wrench-screwdriver',
        children: [
            {
                id: 'Parameter',
                title: 'Parameter',
                type: 'basic',
                icon: 'heroicons_outline:circle-stack',
                link: '/configuration/parameter'
            }]
    }
    , {
        id: 'Masters',
        title: 'Master Setup',
        type: 'collapsable',
        icon: 'heroicons_outline:cog',
        children: [
            {
                id: 'Masters-Region',
                title: 'Region',
                type: 'basic',
                icon: 'heroicons_outline:globe-alt',
                link: '/master/region'
            }, {
                id: 'Masters-Country',
                title: 'Country',
                type: 'basic',
                icon: 'heroicons_outline:map',
                link: '/master/country',
            }, {
                id: 'Masters-Location',
                title: 'Location',
                type: 'basic',
                icon: 'heroicons_outline:map-pin',
                link: '/master/location'
            }, {
                id: 'Masters-Currency',
                title: 'Currency',
                type: 'basic',
                icon: 'heroicons_outline:currency-dollar',
                link: '/master/currency'
            }, {
                id: 'Masters-Currency',
                title: 'Client / Vendor',
                type: 'basic',
                icon: 'heroicons_outline:currency-dollar',
                link: '/client/client-list'
            },
        ]
    }
];
export const compactNavigation: FuseNavigationItem[] = [
    {
        id: 'example',
        title: 'Example',
        type: 'basic',
        icon: 'heroicons_outline:chart-pie',
        link: '/example'
    }, {
        id: 'Contract',
        title: 'Contract',
        type: 'basic',
        icon: 'heroicons_outline:chart-pie',
        link: '/contract'
    }, {
        id: 'Masters',
        title: 'Master Setup',
        type: 'basic',
        icon: 'heroicons_outline:chart-pie',
        link: '/master/country',
        children: [
            {
                id: 'Country',
                title: 'Master',
                type: 'basic',
                icon: 'heroicons_outline:chart-pie',
                link: '/master'
            }, {
                id: 'Currency',
                title: 'Master',
                type: 'basic',
                icon: 'heroicons_outline:chart-pie',
                link: '/master'
            }
        ]
    },
];
export const futuristicNavigation: FuseNavigationItem[] = [
    {
        id: 'example',
        title: 'Example',
        type: 'basic',
        icon: 'heroicons_outline:chart-pie',
        link: '/example'
    }, {
        id: 'Contract',
        title: 'Contract',
        type: 'basic',
        icon: 'heroicons_outline:chart-pie',
        link: '/contract'
    }, {
        id: 'Masters',
        title: 'Master Setup',
        type: 'basic',
        icon: 'heroicons_outline:chart-pie',
        link: '/master/country',
        children: [
            {
                id: 'Country',
                title: 'Master',
                type: 'basic',
                icon: 'heroicons_outline:chart-pie',
                link: '/master'
            }, {
                id: 'Currency',
                title: 'Master',
                type: 'basic',
                icon: 'heroicons_outline:chart-pie',
                link: '/master'
            }
        ]
    },
];
export const horizontalNavigation: FuseNavigationItem[] = [
    {
        id: 'example',
        title: 'Example',
        type: 'basic',
        icon: 'heroicons_outline:chart-pie',
        link: '/example'
    }, {
        id: 'Contract',
        title: 'Contract',
        type: 'basic',
        icon: 'heroicons_outline:chart-pie',
        link: '/contract'
    }
];
