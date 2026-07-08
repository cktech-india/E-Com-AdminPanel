package com.cktech.ecom.controller;

import com.cktech.ecom.model.billingdetails.BillingDetailsDTO;
import com.cktech.ecom.service.BillingDetailsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/billing-details")
public class BillingDetailsController {

    private final BillingDetailsService billingDetailsService;

    public BillingDetailsController(BillingDetailsService billingDetailsService) {
        this.billingDetailsService = billingDetailsService;
    }

    @PostMapping("")
    public ResponseEntity<BillingDetailsDTO> save(@RequestBody BillingDetailsDTO billingDetails) {
        return ResponseEntity.ok(billingDetailsService.save(billingDetails));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BillingDetailsDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(billingDetailsService.get(id));
    }

    @GetMapping("/list")
    public ResponseEntity<List<BillingDetailsDTO>> getList() {
        return ResponseEntity.ok(billingDetailsService.getList());
    }

    @GetMapping("/active-list")
    public ResponseEntity<List<BillingDetailsDTO>> getActiveList() {
        return ResponseEntity.ok(billingDetailsService.getActiveBillingDetailsList());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        billingDetailsService.delete(id);
        return ResponseEntity.ok("Billing Details deleted successfully");
    }
}