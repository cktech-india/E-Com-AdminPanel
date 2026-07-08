package com.cktech.ecom.controller;

import com.cktech.ecom.model.product.DiscountDTO;
import com.cktech.ecom.service.DiscountService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/discount")
public class DiscountController {

    private final DiscountService discountService;

    public DiscountController(DiscountService discountService) {
        this.discountService = discountService;
    }

    @PostMapping
    public ResponseEntity<DiscountDTO> save(@RequestBody DiscountDTO discount) {
        return ResponseEntity.ok(discountService.save(discount));
    }

    @GetMapping
    public ResponseEntity<List<DiscountDTO>> getAllDiscounts() {
        return ResponseEntity.ok(discountService.getActiveDiscountList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DiscountDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(discountService.get(id));
    }

    @GetMapping("/active-list")
    public ResponseEntity<List<DiscountDTO>> getActiveList() {
        return ResponseEntity.ok(discountService.getActiveDiscountList());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {

        discountService.delete(id);

        return ResponseEntity.ok("Discount deleted successfully");
    }
}