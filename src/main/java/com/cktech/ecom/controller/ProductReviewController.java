package com.cktech.ecom.controller;

import com.cktech.ecom.model.product.ProductReviewDTO;
import com.cktech.ecom.service.ProductReviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/product-review")
public class ProductReviewController {

    private final ProductReviewService productReviewService;

    public ProductReviewController(ProductReviewService productReviewService) {
        this.productReviewService = productReviewService;
    }

    @PostMapping
    public ResponseEntity<ProductReviewDTO> save(@RequestBody ProductReviewDTO productReview) {
        return ResponseEntity.ok(productReviewService.save(productReview));
    }

    @GetMapping
    public ResponseEntity<List<ProductReviewDTO>> getAllProductReviews() {
        return ResponseEntity.ok(productReviewService.getActiveProductReviewList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductReviewDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(productReviewService.get(id));
    }

    @GetMapping("/active-list")
    public ResponseEntity<List<ProductReviewDTO>> getActiveList() {
        return ResponseEntity.ok(productReviewService.getActiveProductReviewList());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {

        productReviewService.delete(id);

        return ResponseEntity.ok("Product Review deleted successfully");
    }
}