package com.cktech.ecom.controller;

import com.cktech.ecom.model.tax.TaxCategoryDTO;
import com.cktech.ecom.service.TaxCategoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tax-categories")
public class TaxCategoryController {
    private final TaxCategoryService taxCategoryService;

    public TaxCategoryController(TaxCategoryService taxCategoryService) {
        this.taxCategoryService = taxCategoryService;
    }

    @PostMapping("")
    public ResponseEntity<TaxCategoryDTO> save(@RequestBody TaxCategoryDTO taxCategory) {
        return ResponseEntity.ok(taxCategoryService.save(taxCategory));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaxCategoryDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(taxCategoryService.get(id));
    }

    @GetMapping("/list")
    public ResponseEntity<List<TaxCategoryDTO>> getList() {
        return ResponseEntity.ok(taxCategoryService.getList());
    }

    @GetMapping("/active-list")
    public ResponseEntity<List<TaxCategoryDTO>> getActiveList() {
        return ResponseEntity.ok(taxCategoryService.getActiveList());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        taxCategoryService.delete(id);
        return ResponseEntity.ok("Tax category deleted successfully");
    }
}