package com.cktech.ecom.controller;

import com.cktech.ecom.model.reports.FilterDTO;
import com.cktech.ecom.model.reports.ReportDTO;
import com.cktech.ecom.model.reports.ReportWidgetDTO;
import com.cktech.ecom.service.ReportService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/report")
public class ReportController {
    private final ReportService service;

    public ReportController(ReportService service) {
        this.service = service;
    }

    @GetMapping("/id/{id}")
    public ReportDTO get(@PathVariable String id) {
        return service.get(id);
    }

    @PostMapping("/list-active")
    public List<ReportDTO> getListActive(@RequestBody FilterDTO filter) {
        return service.getActiveList(filter);
    }

    @PostMapping("/widget-data")
    public ReportWidgetDTO getWidgetData(@RequestBody ReportWidgetDTO widgetsDAO, final HttpServletRequest request) {
        if (widgetsDAO.getInputs() == null) {
            widgetsDAO.setInputs(new HashMap<>());
        }
        widgetsDAO.getInputs().put("actionBy", "admin");
        return service.getWidgetData(widgetsDAO);
    }

    @PostMapping("/widget-count")
    public Map<String, Object> getWidgetDataCount(@RequestBody ReportWidgetDTO widgetsDAO) {
        if (widgetsDAO.getInputs() == null) {
            widgetsDAO.setInputs(new HashMap<>());
        }
        return service.getWidgetDataCount(widgetsDAO);
    }
}
