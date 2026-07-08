package com.cktech.ecom.controller;

import com.cktech.ecom.model.billing.BillingDTO;
import com.cktech.ecom.service.BillingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/billing")
public class BillingController {

    private final BillingService billingService;

    public BillingController(BillingService billingService) {
        this.billingService = billingService;
    }

    @PostMapping("")
    public ResponseEntity<BillingDTO> save(@RequestBody BillingDTO billing) {
        return ResponseEntity.ok(billingService.save(billing));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BillingDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(billingService.get(id));
    }

    @GetMapping("/list")
    public ResponseEntity<List<BillingDTO>> getList() {
        return ResponseEntity.ok(billingService.getList());
    }

    @GetMapping("/active-list")
    public ResponseEntity<List<BillingDTO>> getActiveList() {
        return ResponseEntity.ok(billingService.getActiveBillingList());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        billingService.delete(id);
        return ResponseEntity.ok("Billing deleted successfully");
    }
}