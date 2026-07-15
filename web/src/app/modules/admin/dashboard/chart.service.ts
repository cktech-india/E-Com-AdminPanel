import { Injectable, OnInit } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class ChartService implements OnInit {
    constructor() { }

    ngOnInit() { }

    public getColorClass(color: string, type: 'BG' | 'TXT' | 'BG_LITE' | 'TXT_LITE' = 'BG'): string {
        color = color ? color : 'blue';
        // 1. Define the shade mapping based on the type
        const typeMap: Record<string, string> = {
            BG: 'bg-500',
            BG_LITE: 'bg-100',
            TXT: 'text-500',
            TXT_LITE: 'text-100',
        };

        // 2. Define supported colors (normalized to Tailwind color names)
        // Note: 'amber' and 'yellow' are distinct in Tailwind
        const validColors = ['red', 'green', 'blue', 'amber', 'yellow'];

        // 3. Fallback/Safety Check
        const selectedColor = color.toLowerCase();
        const suffix = typeMap[type] || 'bg-500';

        // 4. Return the constructed class (e.g., "bg-blue-500")
        // Note: We split the suffix to handle the property (bg/text) and shade (-100/-500)
        const [property, shade] = suffix.split('-');
        return `${property}-${selectedColor}-${shade}`;
    }

    getProgressData(widget: WidgetModel) {
        if (widget.widgetSubType === 'CIRCLE_PROGRESS') {
            return {
                series: [widget.data[0].value],
                chart: { height: 300, type: 'radialBar' },
                plotOptions: {
                    radialBar: {
                        hollow: { size: '70%', },
                        dataLabels: {
                            name: { show: false },
                            value: { color: '#000', fontSize: '30px', fontWeight: 700, show: true },
                        },
                        track: { background: '#334155' },
                    },
                },
                colors: ['#10b981'],
                stroke: { lineCap: 'round' },
            };
        } else if (widget.widgetSubType === 'CIRCLE_PROGRESS_MULTI') {
            return {
                series: widget?.data?.map((e) => e.value),
                chart: { height: 300, type: 'radialBar' },
                plotOptions: {
                    radialBar: {
                        dataLabels: {
                            name: { fontSize: '22px' },
                            value: { fontSize: '16px', color: '#000' },
                            total: { show: true, label: 'Average', color: '#94a3b8' },
                        },
                        track: { background: '#334155', strokeWidth: '100%', margin: 8 },
                    },
                },
                // colors: ['#3b82f6', '#8b5cf6', '#ec4899'],
                stroke: { lineCap: 'round' },
                labels: widget.data.map((e) => e.title),
            };
        } else if (widget.widgetSubType === 'HALF_CIRCLE_PROGRESS') {
            return {
                series: [widget.data[0].value],
                chart: {
                    height: 400,
                    type: 'radialBar',
                    offsetY: -30, // Shifts the chart up
                    sparkline: { enabled: true },
                },
                plotOptions: {
                    radialBar: {
                        startAngle: -90,
                        endAngle: 90,
                        track: { background: '#334155', strokeWidth: '97%' },
                        dataLabels: {
                            name: { show: false },
                            value: {
                                offsetY: -10, // Centers the value in the arc
                                fontSize: '42px',
                                fontWeight: 'bold',
                                color: '#363333',
                            },
                        },
                    },
                },
                colors: ['#f59e0b'],
                stroke: { lineCap: 'round' },
            };
        } else {
            return {
                series: widget?.data?.map((e) => e.value),
                chart: {
                    height: 400,
                    type: 'radialBar',
                    offsetY: -30, // Shifts the chart up
                    sparkline: { enabled: true },
                },
                plotOptions: {
                    radialBar: {
                        startAngle: -90,
                        endAngle: 90,
                        track: { background: '#334155', strokeWidth: '100%', margin: 10 },
                        dataLabels: {
                            name: { show: true, offsetY: 25, color: '#94a3b8', fontSize: '14px' },
                            value: {
                                offsetY: -15,
                                fontSize: '32px',
                                fontWeight: 'bold',
                                color: '#403e3e',
                            },
                            total: {
                                show: true,
                                label: 'Average',
                                color: '#94a3b8'
                            },
                        },
                    },
                },
                // colors: ['#3b82f6', '#10b981'],
                stroke: { lineCap: 'round' },
                labels: widget?.data?.map((e) => e.title),
            };
        }
    }
    getChartData(widget: WidgetModel): any {
        const chartConfiguration = widget.widgetProperties;
        switch (widget.widgetSubType) {
            case 'LINE':
                return this.getLineChart(widget, chartConfiguration);
            case 'RADAR':
                return this.getRadarChart(widget, chartConfiguration);
            case 'BAR':
                return this.getBarChart(widget, chartConfiguration);
            case 'STACKED_BAR':
                return this.getStackedBarChart(widget, chartConfiguration);
            case 'PIE':
                return this.getPieChart(widget, chartConfiguration);
            case 'DONUT':
                return this.getDonutChart(widget, chartConfiguration);
            case 'COLUMN':
                return this.getColumnChart(widget, chartConfiguration);
            case 'STACKED_COLUMN':
                return this.getStackedColumnChart(widget, chartConfiguration);
            case 'BUBBLE':
                return this.getBubbleChart(widget, chartConfiguration);
            default:
                return {};
        }
    }

    formLabelWithData(data: any[], categoriesColumn: string, valueColumn: string) {
        const categoriesData = [];
        const valueData = [];
        data.forEach((e) => {
            if (!categoriesData.includes(e[categoriesColumn])) {
                categoriesData.push(e[categoriesColumn]);
                valueData.push(e[valueColumn]);
            } else {
                valueData[categoriesData.findIndex((d) => d === e[categoriesColumn])] += e[valueColumn];
            }
        });
        return [categoriesData, valueData];
    }

    formLabelSeriesWithData(data: any[], categoriesColumn: string, valueColumn: string, seriesColumn: string) {
        const categoriesUniqeValue = [...new Set(data.map((item) => item[categoriesColumn]))];
        const seriesUniqueValue = [...new Set(data.map((item) => item[seriesColumn]))];
        const seriesData = [];
        seriesUniqueValue.forEach((ser) => {
            const tempData = [];
            categoriesUniqeValue.forEach((cat) => {
                tempData.push(
                    data
                        .filter((e) => e[seriesColumn] === ser && e[categoriesColumn] === cat)
                        .reduce((old, val) => old + val[valueColumn], 0)
                );
            });
            seriesData.push({
                name: ser,
                data: tempData,
            });
        });
        return [categoriesUniqeValue, seriesData];
    }

    getPieChart(widget: WidgetModel, chartConfig: any) {
        //const temp = this.formLabelWithData(widget.data, chartConfig.labelColumn, chartConfig.valueColumn);
        return {
            series: widget.data[0].values.slice(0, 500),
            chart: {
                height: 350,
                type: 'pie',
            },
            labels: widget.data[0].categories.slice(0, 500),
            responsive: [
                {
                    breakpoint: 480,
                    options: {
                        legend: {
                            position: 'bottom',
                        },
                    },
                },
            ],
        };
    }

    getDonutChart(widget: WidgetModel, chartConfig: any) {
        // const temp = this.formLabelWithData(widget.data, chartConfig.labelColumn, chartConfig.valueColumn);
        return {
            series: widget.data[0].values.slice(0, 500),
            chart: {
                height: 350,
                type: 'donut',
            },
            labels: widget.data[0].categories.slice(0, 500),
            responsive: [
                {
                    breakpoint: 480,
                    options: {
                        legend: {
                            position: 'bottom',
                        },
                    },
                },
            ],
        };
    }

    getBarChart(widget: WidgetModel, chartConfig: any) {
        return {
            series: widget.data[0].series,
            chart: {
                type: 'bar',
                height: 350,
            },
            plotOptions: {
                bar: {
                    horizontal: true,
                    dataLabels: {
                        position: 'top',
                    },
                },
            },
            dataLabels: {
                enabled: true,
                offsetX: -6,
                style: {
                    fontSize: '12px',
                    colors: ['#fff'],
                },
            },
            stroke: {
                show: true,
                width: 1,
                colors: ['#fff'],
            },
            tooltip: {
                shared: true,
                intersect: false,
            },
            xaxis: {
                categories: widget.data[0].categories,
            },
        };
    }

    getStackedBarChart(widget: WidgetModel, chartConfig: any) {
        return {
            series: widget.data[0].series,
            chart: {
                type: 'bar',
                height: 350,
                stacked: true,
            },
            plotOptions: {
                bar: {
                    horizontal: true,
                },
            },
            stroke: {
                width: 1,
                colors: ['#fff'],
            },
            xaxis: {
                categories: widget.data[0].categories,
                labels: {
                    formatter: (val) => {
                        return val + 'K';
                    },
                },
            },
            yaxis: {
                title: {
                    text: undefined,
                },
            },
            tooltip: {
                y: {
                    formatter: (val) => {
                        return val + 'K';
                    },
                },
            },
            fill: {
                opacity: 1,
            },
            legend: {
                position: 'top',
                horizontalAlign: 'left',
                offsetX: 40,
            },
        };
    }

    getColumnChart(widget: WidgetModel, chartConfig: any) {
        return {
            series: widget.data[0].series,
            chart: {
                type: 'bar',
                height: 350,
                toolbar: {
                    show: false,
                },
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: '55%',
                    endingShape: 'rounded',
                },
            },
            dataLabels: {
                enabled: true,
            },
            stroke: {
                show: false,
                width: 2,
                colors: ['transparent'],
            },
            xaxis: {
                categories: widget.data[0].categories,
            },
            yaxis: {
                title: {
                    text: undefined,
                },
            },
            fill: {
                opacity: 1,
            },
            tooltip: {
                y: {
                    formatter: (val) => {
                        return '' + val + '';
                    },
                },
            },
        };
    }

    getStackedColumnChart(widget: WidgetModel, chartConfig: any) {
        return {
            series: widget.data[0].series,
            chart: {
                type: 'bar',
                height: 350,
                stacked: true,
                toolbar: {
                    show: true,
                },
                zoom: {
                    enabled: true,
                },
            },
            responsive: [
                {
                    breakpoint: 480,
                    options: {
                        legend: {
                            position: 'bottom',
                            offsetX: -10,
                            offsetY: 0,
                        },
                    },
                },
            ],
            plotOptions: {
                bar: {
                    horizontal: false,
                    borderRadius: 10,
                },
            },
            xaxis: {
                categories: widget.data[0].categories,
            },
            legend: {
                position: 'right',
                offsetY: 40,
            },
            fill: {
                opacity: 1,
            },
        };
    }

    getRadarChart(widget: WidgetModel, chartConfig: any) {
        const chartObject = {
            chart: {
                height: 350,
                type: 'radar',
            },
            series: widget.data[0].series,
            labels: widget.data[0].categories,
            plotOptions: {
                radar: {
                    size: 140,
                    polygons: {
                        strokeColor: '#e9e9e9',
                        fill: {
                            colors: ['#f8f8f8', '#fff'],
                        },
                    },
                },
            },
            colors: ['#FF4560'],
            markers: {
                size: 4,
                colors: ['#fff'],
                strokeColor: '#FF4560',
                strokeWidth: 2,
            },
            tooltip: {
                y: {
                    formatter: (val: number) => {
                        return val;
                    },
                },
            },
            yaxis: {
                tickAmount: widget.data[0].categories.length,
                labels: {
                    formatter: (val: number, i: number) => {
                        if (i % 2 === 0) {
                            return val;
                        } else {
                            return '';
                        }
                    },
                },
            },
        };
        return chartObject;
    }

    getLineChart(widget: WidgetModel, chartConfig: any) {
        const chartObject = {
            chart: {
                height: 350,
                type: 'area',
                toolbar: false,
            },
            dataLabels: {
                enabled: false,
            },
            stroke: {
                curve: 'smooth',
            },
            series: widget.data[0].series,
            xaxis: {
                type: 'datetime',
                categories: widget.data[0].categories,
            },
            tooltip: {
                x: {
                    format: 'dd/MM/yy HH:mm',
                },
            },
            legend: {
                position: 'top',
                horizontalAlign: 'right',
            },
        };
        return chartObject;
    }

    getBubbleChart(widget: WidgetModel, chartConfig: any) {
        return {
            series: widget.data[0].series,
            chart: {
                height: 350,
                type: 'bubble',
            },
            dataLabels: {
                enabled: false,
            },
            fill: {
                type: 'gradient',
            },
            title: {
                text: undefined,
            },
            xaxis: {
                tickAmount: 12,
                type: 'datetime',
                labels: {
                    rotate: 0,
                },
            },
            yaxis: {
                max: 70,
            },
            theme: {
                palette: 'palette2',
            },
        };
    }

    getHeatMapChart(widget: WidgetModel, chartConfig: any) {
        return {
            series: widget.data[0].series,
            chart: {
                height: 350,
                type: 'heatmap',
            },
            dataLabels: {
                enabled: false,
            },
            colors: ['#008FFB'],
            title: {
                text: undefined,
            },
        };
    }
}

export interface WidgetModel {
    widgetCode: string;
    widgetTitle: string;
    widgetType: string;
    widgetSubType: string;
    processNameOrQuery: string;
    filterColumns: string | any[];
    dataColumns: any[];
    widgetProperties: string;
    isActive: boolean;
    isDeleted: boolean;
    widthPercentage: number;
    sequenceNo: number;
    customTitle: string;
    inputs: any;
    chart?: any;
    chartOptions?: any;
    data?: any[];
    templateReference?: any;
    isLoading: boolean;
    totalRecords?: number;
    exportAs?: string;
    viewType?: string;
    textData?: string;
}
export class ActionButtonModel {
    actionCode: string;
    actionLabel: string;
    customActionMethod: string;
    buttonColor: 'accent' | 'primary' | 'warn';
}

export class GridActionButtonModel {
    label: string;
    actionCode: string;
    type: string;
    customActionMethod: string;
    color: 'accent' | 'primary' | 'warn' | 'default';
    icon: string;
    tooltip: string;
    href?: string;
}

export class DropdownModel {
    label: string;
    value: any;
    isFound?: boolean;
}
