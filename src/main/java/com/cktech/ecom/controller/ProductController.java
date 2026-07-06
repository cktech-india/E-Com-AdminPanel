package com.cktech.ecom.controller;

import com.cktech.ecom.model.product.ProductDTO;
import com.cktech.ecom.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    // Create Product
    @PostMapping
    public ResponseEntity<ProductDTO> save(@RequestBody ProductDTO product) {
        return ResponseEntity.ok(productService.save(product));
    }

    // Get All Products
    @GetMapping
    public ResponseEntity<List<ProductDTO>> getAllProducts() {
        return ResponseEntity.ok(productService.getActiveProductList());
    }

    // Get Product By ID
    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.get(id));
    }


    // Get Active Products
    @GetMapping("/active-list")
    public ResponseEntity<List<ProductDTO>> getActiveList() {
        return ResponseEntity.ok(productService.getActiveProductList());
    }

    // Delete Product (Soft Delete)
    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.ok("Product deleted successfully");
    }
}