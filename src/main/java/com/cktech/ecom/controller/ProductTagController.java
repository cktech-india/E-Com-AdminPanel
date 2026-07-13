package com.cktech.ecom.controller;

import com.cktech.ecom.model.product.ProductTagDTO;
import com.cktech.ecom.service.ProductTagService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/product-tag")
public class ProductTagController {

    private final ProductTagService productTagService;

    public ProductTagController(ProductTagService productTagService) {
        this.productTagService = productTagService;
    }

    // Create Tag
    @PostMapping
    public ResponseEntity<ProductTagDTO> save(@RequestBody ProductTagDTO productTag) {
        return ResponseEntity.ok(productTagService.save(productTag));
    }

    // Get All Tags
    @GetMapping
    public ResponseEntity<List<ProductTagDTO>> getAllTags() {
        return ResponseEntity.ok(productTagService.getActiveProductTagList());
    }

    // Get Tag By ID
    @GetMapping("/{id}")
    public ResponseEntity<ProductTagDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(productTagService.get(id));
    }

    // Get Active Tags
    @GetMapping("/active-list")
    public ResponseEntity<List<ProductTagDTO>> getActiveList() {
        return ResponseEntity.ok(productTagService.getActiveProductTagList());
    }

    // Soft Delete
    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {

        productTagService.delete(id);

        return ResponseEntity.ok("Product Tag deleted successfully");
    }
}