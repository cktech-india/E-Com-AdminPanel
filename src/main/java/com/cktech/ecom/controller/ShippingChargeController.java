package com.cktech.ecom.controller;

import com.cktech.ecom.model.tax.ShippingChargeDTO;
import com.cktech.ecom.service.ShippingChargeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shipping-charges")
public class ShippingChargeController {
    private final ShippingChargeService shippingChargeService;

    public ShippingChargeController(ShippingChargeService shippingChargeService) {
        this.shippingChargeService = shippingChargeService;
    }

    @PostMapping("")
    public ResponseEntity<ShippingChargeDTO> save(@RequestBody ShippingChargeDTO shippingCharge) {
        return ResponseEntity.ok(shippingChargeService.save(shippingCharge));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ShippingChargeDTO> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(shippingChargeService.get(id));
    }

    @GetMapping("/list")
    public ResponseEntity<List<ShippingChargeDTO>> getList() {
        return ResponseEntity.ok(shippingChargeService.getList());
    }

    @GetMapping("/active-list")
    public ResponseEntity<List<ShippingChargeDTO>> getActiveList() {
        return ResponseEntity.ok(shippingChargeService.getActiveList());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Integer id) {
        shippingChargeService.delete(id);
        return ResponseEntity.ok("Shipping charge deleted successfully");
    }
}