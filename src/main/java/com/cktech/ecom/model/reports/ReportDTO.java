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
public class ReportDTO {
    private String reportCode;
    private String reportTitle;
    private String reportType;
    private List<Map<String, Object>> filterColumns;
    private Map<String, Object> reportProperties;
    private List<ReportWidgetDTO> reportWidgets;
    private Boolean isActive;
    private Boolean isDeleted;
}
