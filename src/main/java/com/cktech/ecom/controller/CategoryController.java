package com.cktech.ecom.controller;

import com.cktech.ecom.model.category.CategoryDTO;
import com.cktech.ecom.service.CategoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @PostMapping("")
    public ResponseEntity<CategoryDTO> save(@RequestBody CategoryDTO category) {
        return ResponseEntity.ok(categoryService.save(category));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(categoryService.get(id));
    }

    @GetMapping("/list")
    public ResponseEntity<List<CategoryDTO>> getList() {
        return ResponseEntity.ok(categoryService.getList());
    }

    @GetMapping("/active-list")
    public ResponseEntity<List<CategoryDTO>> getActiveList() {
        return ResponseEntity.ok(categoryService.getActiveCategoryList());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        categoryService.delete(id);
        return ResponseEntity.ok("Category deleted successfully");
    }
}