package com.cktech.ecom.controller;

import com.cktech.ecom.model.config.AppConfigDTO;
import com.cktech.ecom.service.AppConfigService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/app-config")
public class AppConfigController {

    private final AppConfigService appConfigService;

    public AppConfigController(AppConfigService appConfigService) {
        this.appConfigService = appConfigService;
    }

    @PostMapping("")
    public ResponseEntity<AppConfigDTO> save(@RequestBody AppConfigDTO config) {
        return ResponseEntity.ok(appConfigService.save(config));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AppConfigDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(appConfigService.get(id));
    }

    @GetMapping("/list")
    public ResponseEntity<List<AppConfigDTO>> getList() {
        return ResponseEntity.ok(appConfigService.getList());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        appConfigService.delete(id);
        return ResponseEntity.ok("App Configuration deleted successfully");
    }
}
