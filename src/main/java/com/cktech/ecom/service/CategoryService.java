package com.cktech.ecom.service;

import com.cktech.ecom.model.category.CategoryDTO;
import com.cktech.ecom.repository.CategoryRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public CategoryDTO save(CategoryDTO category) {
        return categoryRepository.save(category);
    }

    public CategoryDTO get(Long id) {
        return categoryRepository.findById(id).orElseThrow();
    }

    public List<CategoryDTO> getList() {
        return categoryRepository.findByIsDeletedFalse();
    }
    public List<CategoryDTO> getActiveCategoryList() {
        return categoryRepository.findByIsDeletedFalseAndIsActiveTrue();
    }

    @Transactional
    public void delete(Long id) {
        var data = categoryRepository.findById(id).orElseThrow();
        data.setIsDeleted(true);
        categoryRepository.save(data);
    }
}