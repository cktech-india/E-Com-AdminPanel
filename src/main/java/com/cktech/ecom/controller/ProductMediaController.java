package com.cktech.ecom.controller;

import com.cktech.ecom.model.product.ProductMediaDTO;
import com.cktech.ecom.service.ProductMediaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/product-media")
public class ProductMediaController {

    private final ProductMediaService productMediaService;

    public ProductMediaController(ProductMediaService productMediaService) {
        this.productMediaService = productMediaService;
    }

    @PostMapping
    public ResponseEntity<ProductMediaDTO> save(@RequestBody ProductMediaDTO productMedia) {
        return ResponseEntity.ok(productMediaService.save(productMedia));
    }



    @GetMapping("/{id}")
    public ResponseEntity<ProductMediaDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(productMediaService.get(id));
    }

    @GetMapping("/active-list")
    public ResponseEntity<List<ProductMediaDTO>> getActiveList() {
        return ResponseEntity.ok(productMediaService.getActiveProductMediaList());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        productMediaService.delete(id);
        return ResponseEntity.ok("Product Media deleted successfully");
    }
}