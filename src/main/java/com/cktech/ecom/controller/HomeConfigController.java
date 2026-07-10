package com.cktech.ecom.controller;

import com.cktech.ecom.model.tax.HomeConfigDTO;
import com.cktech.ecom.service.HomeConfigService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/home-config")
public class HomeConfigController {
    private final HomeConfigService homeConfigService;

    public HomeConfigController(HomeConfigService homeConfigService) {
        this.homeConfigService = homeConfigService;
    }

    @PostMapping("")
    public ResponseEntity<HomeConfigDTO> save(@RequestBody HomeConfigDTO homeConfig) {
        return ResponseEntity.ok(homeConfigService.save(homeConfig));
    }

    @GetMapping("/{id}")
    public ResponseEntity<HomeConfigDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(homeConfigService.get(id));
    }

    @GetMapping("/list")
    public ResponseEntity<List<HomeConfigDTO>> getList() {
        return ResponseEntity.ok(homeConfigService.getList());
    }

    @GetMapping("/active-list")
    public ResponseEntity<List<HomeConfigDTO>> getActiveList() {
        return ResponseEntity.ok(homeConfigService.getActiveList());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        homeConfigService.delete(id);
        return ResponseEntity.ok("Home config deleted successfully");
    }
}