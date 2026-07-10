package com.cktech.ecom.controller;

import com.cktech.ecom.model.tax.TaxRateDTO;
import com.cktech.ecom.service.TaxRateService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tax-rates")
public class TaxRateController {
    private final TaxRateService taxRateService;

    public TaxRateController(TaxRateService taxRateService) {
        this.taxRateService = taxRateService;
    }

    @PostMapping("")
    public ResponseEntity<TaxRateDTO> save(@RequestBody TaxRateDTO taxRate) {
        return ResponseEntity.ok(taxRateService.save(taxRate));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaxRateDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(taxRateService.get(id));
    }

    @GetMapping("/list")
    public ResponseEntity<List<TaxRateDTO>> getList() {
        return ResponseEntity.ok(taxRateService.getList());
    }

    @GetMapping("/active-list")
    public ResponseEntity<List<TaxRateDTO>> getActiveList() {
        return ResponseEntity.ok(taxRateService.getActiveList());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        taxRateService.delete(id);
        return ResponseEntity.ok("Tax rate deleted successfully");
    }
}