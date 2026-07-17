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
public class ReportExportDTO {
    private String reportId;
    private String title;
    private String exportAs;
    private Map<String, Object> inputs;
    private List<Map<String, Object>> data;
    private List<Map<String, Object>> columns;
    private Map<String, Object> exportAdditional;
}
