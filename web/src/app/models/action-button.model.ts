export interface ActionButtonModel {
    actionCode: string;
    actionLabel: string;
    customActionMethod: string;
    buttonColor: 'accent' | 'primary' | 'warn';
    iif: any;
}

export interface GridActionButtonModel {
    label: string;
    actionCode: string;
    type: string;
    customActionMethod: string;
    color: 'accent' | 'primary' | 'warn' | 'default';
    icon: string;
    tooltip: string;
    href?: string;
}

