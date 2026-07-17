package com.cktech.ecom.model.reports;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportWidgetDTO {
    private String widgetCode;
    private String widgetTitle;
    private String widgetType;
    private String widgetSubType;
    private Double widthPercentage;
    private String processNameOrQuery;
    private List<Map<String, Object>> dataColumns;
    private List<Map<String, Object>> filterColumns;
    private Map<String, Object> widgetProperties;
    private Map<String, Object> inputs;
    private Object data;
    private String exportAs;
}
