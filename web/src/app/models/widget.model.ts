export interface WidgetModel {

    widgetCode: string;
    widgetTitle: string;
    widgetType: string;
    widgetSubType: string;
    processNameOrQuery: string;
    countProcessNameOrQuery: string;
    filterColumns: string | any[];
    dataColumns: any[];
    widgetProperties: string | any;
    isActive: boolean;
    isDeleted: boolean;
    widthPercentage: number;
    sequenceNo: number;
    customTitle: string;
    inputs: any;
    chart?: any;
    data?: any[];
    templateReference?: any;
    isLoading: boolean;
    totalRecords?: number;
    exportAs?: string;
    displayColumns?: string[];
    dataSource?: any;
    paginator?: any;
}
