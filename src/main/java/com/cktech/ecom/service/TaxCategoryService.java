package com.cktech.ecom.service;

import com.cktech.ecom.model.tax.TaxCategoryDTO;
import com.cktech.ecom.repository.TaxCategoryRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaxCategoryService {
    private final TaxCategoryRepository taxCategoryRepository;

    public TaxCategoryService(TaxCategoryRepository taxCategoryRepository) {
        this.taxCategoryRepository = taxCategoryRepository;
    }

    public TaxCategoryDTO save(TaxCategoryDTO taxCategory) {
        return taxCategoryRepository.save(taxCategory);
    }

    public TaxCategoryDTO get(Long id) {
        return taxCategoryRepository.findById(id).orElseThrow();
    }

    public List<TaxCategoryDTO> getList() {
        return taxCategoryRepository.findByIsDeletedFalse();
    }

    public List<TaxCategoryDTO> getActiveList() {
        return taxCategoryRepository.findByIsDeletedFalseAndIsActiveTrue();
    }

    @Transactional
    public void delete(Long id) {
        taxCategoryRepository.updateIsDeletedFlag(id, true, "id");
    }
}