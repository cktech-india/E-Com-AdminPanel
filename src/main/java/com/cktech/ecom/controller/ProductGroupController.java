package com.cktech.ecom.controller;

import com.cktech.ecom.model.product.ProductGroupDTO;
import com.cktech.ecom.service.ProductGroupService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/product-group")
public class ProductGroupController {

    private final ProductGroupService productGroupService;

    public ProductGroupController(ProductGroupService productGroupService) {
        this.productGroupService = productGroupService;
    }

    @PostMapping
    public ResponseEntity<ProductGroupDTO> save(@RequestBody ProductGroupDTO productGroup) {
        return ResponseEntity.ok(productGroupService.save(productGroup));
    }

    @GetMapping
    public ResponseEntity<List<ProductGroupDTO>> getAllProductGroups() {
        return ResponseEntity.ok(productGroupService.getActiveProductGroupList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductGroupDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(productGroupService.get(id));
    }

    @GetMapping("/active-list")
    public ResponseEntity<List<ProductGroupDTO>> getActiveList() {
        return ResponseEntity.ok(productGroupService.getActiveProductGroupList());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {

        productGroupService.delete(id);

        return ResponseEntity.ok("Product Group deleted successfully");
    }

}