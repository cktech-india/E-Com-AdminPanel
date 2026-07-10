package com.cktech.ecom.controller;

import com.cktech.ecom.model.company.CompanyDTO;
import com.cktech.ecom.service.CompanyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/companies")
public class CompanyController {

    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    @PostMapping("")
    public ResponseEntity<CompanyDTO> save(@RequestBody CompanyDTO company) {
        return ResponseEntity.ok(companyService.save(company));
    }

    @GetMapping("/{companyCode}")
    public ResponseEntity<CompanyDTO> getById(@PathVariable String companyCode) {
        return ResponseEntity.ok(companyService.get(companyCode));
    }

    @GetMapping("/list")
    public ResponseEntity<List<CompanyDTO>> getList() {
        return ResponseEntity.ok(companyService.getList());
    }

    @GetMapping("/active-list")
    public ResponseEntity<List<CompanyDTO>> getActiveList() {
        return ResponseEntity.ok(companyService.getActiveCompanyList());
    }

    @DeleteMapping("/{companyCode}")
    public ResponseEntity<String> delete(@PathVariable String companyCode) {
        companyService.delete(companyCode);
        return ResponseEntity.ok("Company deleted successfully");
    }
}