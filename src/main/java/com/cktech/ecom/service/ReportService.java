package com.cktech.ecom.service;

import com.cktech.ecom.model.reports.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.util.*;

@Service
public class ReportService {
    private static final Logger LOG = LoggerFactory.getLogger(ReportService.class);
    private static final String REPORTS_DIR_PATH = "config/assets/reports/";
    private static final String COUNT_QUERY_BUILDER = "SELECT COUNT(*) as count FROM (#query) AS count_temp";

    private final QueryService queryService;
    private final NamedParameterJdbcTemplate namedParameterJdbcTemplate;
    private final ObjectMapper objectMapper;

    public ReportService(QueryService queryService, NamedParameterJdbcTemplate namedParameterJdbcTemplate, ObjectMapper objectMapper) {
        this.queryService = queryService;
        this.namedParameterJdbcTemplate = namedParameterJdbcTemplate;
        this.objectMapper = objectMapper;
    }

    public ReportDTO get(String id) {
        File file = new File(REPORTS_DIR_PATH + id + ".json");
        if (!file.exists()) {
            throw new NoSuchElementException("Report configuration not found with ID: " + id);
        }
        try {
            return objectMapper.readValue(file, ReportDTO.class);
        } catch (IOException e) {
            LOG.error("Failed to parse report JSON for ID: {}", id, e);
            throw new RuntimeException("Failed to read report configuration", e);
        }
    }

    public List<ReportDTO> getActiveList(FilterDTO filter) {
        // Since reports are configuration-driven, we can scan the reports directory and load all active ones
        List<ReportDTO> activeReports = new ArrayList<>();
        File dir = new File(REPORTS_DIR_PATH);
        if (dir.exists() && dir.isDirectory()) {
            File[] files = dir.listFiles((d, name) -> name.endsWith(".json"));
            if (files != null) {
                for (File file : files) {
                    try {
                        ReportDTO report = objectMapper.readValue(file, ReportDTO.class);
                        if (Boolean.TRUE.equals(report.getIsActive()) && !Boolean.TRUE.equals(report.getIsDeleted()) && "REPORT".equals(report.getReportType())) {
                            activeReports.add(report);
                        }
                    } catch (IOException e) {
                        LOG.warn("Failed to load report from file: {}", file.getName(), e);
                    }
                }
            }
        }
        return activeReports;
    }

    public Map<String, Object> getWidgetDataCount(ReportWidgetDTO input) {
        ReportWidgetDTO widget = loadWidgetConfig(input.getWidgetCode());
        if (widget == null) {
            widget = input;
        }
        widget.setInputs(input.getInputs() != null ? input.getInputs() : new HashMap<>());
        String query = COUNT_QUERY_BUILDER.replace("#query", getWidgetQuery(widget));
        try {
            return namedParameterJdbcTemplate.queryForMap(query, widget.getInputs());
        } catch (Exception e) {
            LOG.error("Failed to execute count query: {}", query, e);
            return Map.of("count", 0L);
        }
    }

    public ReportWidgetDTO getWidgetData(ReportWidgetDTO input) {
        ReportWidgetDTO widget = loadWidgetConfig(input.getWidgetCode());
        if (widget == null) {
            widget = input;
        }
        widget.setInputs(input.getInputs() != null ? input.getInputs() : new HashMap<>());
        String query = getWidgetQuery(widget);
        try {
            if ("CHART".equals(widget.getWidgetType())) {
                List<ChartDataDTO> data = namedParameterJdbcTemplate.query(query, widget.getInputs(), new BeanPropertyRowMapper<>(ChartDataDTO.class));
                if (widget.getWidgetProperties() != null && "true".equals(widget.getWidgetProperties().getOrDefault("hasSeries", "false").toString())) {
                    widget.setData(this.formLabelSeriesWithData(widget, data));
                } else {
                    widget.setData(this.formLabelWithData(widget, data));
                }
            } else {
                List<Map<String, Object>> data = namedParameterJdbcTemplate.queryForList(query, widget.getInputs());
                widget.setData(data);
                loadWidgetInfo(widget);
            }
        } catch (Exception e) {
            LOG.error("Failed to execute widget query: {}", query, e);
            widget.setData(new ArrayList<>());
        }
        widget.setProcessNameOrQuery(null);
        return widget;
    }

    private ReportWidgetDTO loadWidgetConfig(String widgetCode) {
        // Scans reports for the widget matching the widgetCode
        File dir = new File(REPORTS_DIR_PATH);
        if (dir.exists() && dir.isDirectory()) {
            File[] files = dir.listFiles((d, name) -> name.endsWith(".json"));
            if (files != null) {
                for (File file : files) {
                    try {
                        ReportDTO report = objectMapper.readValue(file, ReportDTO.class);
                        if (report.getReportWidgets() != null) {
                            for (ReportWidgetDTO widget : report.getReportWidgets()) {
                                if (widgetCode.equals(widget.getWidgetCode())) {
                                    return widget;
                                }
                            }
                        }
                    } catch (IOException e) {
                        LOG.warn("Failed to read report config while searching widget: {}", file.getName(), e);
                    }
                }
            }
        }
        return null;
    }

    private String getWidgetQuery(ReportWidgetDTO widget) {
        String query = "";
        String processOrQuery = widget.getProcessNameOrQuery();
        if (processOrQuery == null) {
            processOrQuery = "";
        }
        if (processOrQuery.contains(" ")) {
            query = processOrQuery;
        } else {
            query = queryService.getQuery("SELECT_" + processOrQuery);
        }

        if (!query.contains(" LIMIT ")) {
            query += this.queryService.formLimit(widget.getInputs());
        }
        return query;
    }

    private void loadWidgetInfo(ReportWidgetDTO widgetInput) {
        try {
            if (!(widgetInput.getData() instanceof List)) {
                return;
            }
            List<Map<String, Object>> result = (List<Map<String, Object>>) widgetInput.getData();
            Map<String, Object> widgetProperties = widgetInput.getWidgetProperties();
            if (widgetProperties == null) {
                return;
            }

            boolean b = widgetProperties.get("haveDynamicColumns") instanceof Boolean
                    && widgetProperties.get("haveDynamicColumns").equals(true);

            if (!result.isEmpty() && b) {
                if (widgetInput.getDataColumns() == null) {
                    widgetInput.setDataColumns(new ArrayList<>());
                }
                var data = widgetInput.getDataColumns();
                List<String> excludeColumns = new ArrayList<>();
                if (widgetProperties.get("excludeDynamicColumns") instanceof List) {
                    excludeColumns = (List<String>) widgetProperties.get("excludeDynamicColumns");
                }

                for (var key : result.get(0).keySet()) {
                    if (!excludeColumns.contains(key)) {
                        data.add(Map.of("header", key, "field", key));
                    }
                }
                widgetInput.setDataColumns(data);
            }
        } catch (Exception ex) {
            LOG.error("Error loading widget info", ex);
        }
    }

    private List<Map<String, Object>> formLabelSeriesWithData(final ReportWidgetDTO widget, final List<ChartDataDTO> data) {
        var categoriesUniqeValue = data.stream().map(ChartDataDTO::getCategoryValue).filter(Objects::nonNull).distinct().toList();
        var seriesUniqueValue = data.stream().map(ChartDataDTO::getSeriesValue).filter(Objects::nonNull).distinct().toList();
        var seriesData = new ArrayList<Map<String, Object>>();
        for (var ser : seriesUniqueValue) {
            var currentSeriesValue = new ArrayList<>();
            for (var cat : categoriesUniqeValue) {
                var value = data.stream().filter(f ->
                                (ser.equals(f.getSeriesValue()) || (f.getSeriesValue() != null && f.getSeriesValue().toString().equals(ser.toString())))
                                        && (cat.equals(f.getCategoryValue()) || (f.getCategoryValue() != null && f.getCategoryValue().toString().equals(cat.toString())))
                                        && f.getDataValue() != null)
                        .mapToDouble(ChartDataDTO::getDataValue).sum();
                currentSeriesValue.add(value);
            }
            var mapData = new HashMap<String, Object>();
            mapData.put("name", ser);
            mapData.put("data", currentSeriesValue);
            seriesData.add(mapData);
        }
        return List.of(Map.of("categories", categoriesUniqeValue, "series", seriesData));
    }

    private List<Map<String, Object>> formLabelWithData(final ReportWidgetDTO widget, final List<ChartDataDTO> data) {
        var categoriesData = new ArrayList<>();
        var valueData = new ArrayList<Double>();
        for (var row : data) {
            if (row.getCategoryValue() == null) continue;
            if (!categoriesData.contains(row.getCategoryValue())) {
                categoriesData.add(row.getCategoryValue());
                valueData.add(row.getDataValue() != null ? row.getDataValue() : 0.0);
            } else {
                var index = categoriesData.indexOf(row.getCategoryValue());
                valueData.set(index, valueData.get(index) + (row.getDataValue() != null ? row.getDataValue() : 0.0));
            }
        }
        if (List.of("PIE", "DONUT").contains(widget.getWidgetSubType())) {
            return List.of(Map.of("categories", categoriesData, "values", valueData));
        } else {
            return List.of(Map.of("categories", categoriesData, "series",
                    List.of(Map.of("name", widget.getWidgetTitle(), "data", valueData))));
        }
    }
}
