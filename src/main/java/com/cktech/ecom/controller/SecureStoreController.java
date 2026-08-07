package com.cktech.ecom.controller;

import com.cktech.ecom.service.SecureStoreService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/secure-store")
@CrossOrigin("*")
public class SecureStoreController {

    private final SecureStoreService secureStoreService;

    public SecureStoreController(SecureStoreService secureStoreService) {
        this.secureStoreService = secureStoreService;
    }

    @GetMapping("/configs")
    public ResponseEntity<List<Map<String, Object>>> getConfigs(
            @RequestParam String companyCode,
            @RequestParam(required = false) String groupType,
            @RequestParam(required = false) String groupName) {
        return ResponseEntity.ok(secureStoreService.getAllConfigs(companyCode, groupType, groupName));
    }

    @PostMapping("/config")
    public ResponseEntity<?> saveConfig(@RequestBody Map<String, String> request) {
        String companyCode = request.get("companyCode");
        String configCode = request.get("configCode");
        String rawValue = request.get("configValue");
        String groupName = request.get("groupName");
        String groupType = request.get("groupType");
        String user = request.getOrDefault("user", "admin");

        if (companyCode == null || configCode == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "companyCode and configCode are required."));
        }

        secureStoreService.saveOrUpdateConfig(companyCode, configCode, rawValue, groupName, groupType, user);
        return ResponseEntity.ok(Map.of("status", "SUCCESS", "message", "Configuration saved successfully."));
    }

    @GetMapping("/gateways")
    public ResponseEntity<List<String>> getAvailableGateways(@RequestParam String companyCode) {
        return ResponseEntity.ok(secureStoreService.getAvailablePaymentGateways(companyCode));
    }

    @DeleteMapping("/config")
    public ResponseEntity<?> deleteConfig(
            @RequestParam String companyCode,
            @RequestParam String configCode) {
        secureStoreService.deleteConfig(companyCode, configCode);
        return ResponseEntity.ok(Map.of("status", "SUCCESS", "message", "Configuration deleted successfully."));
    }
}
