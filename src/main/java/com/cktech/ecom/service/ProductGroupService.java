package com.cktech.ecom.service;

import com.cktech.ecom.model.product.ProductGroupDTO;
import com.cktech.ecom.repository.ProductGroupRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductGroupService {

    private final ProductGroupRepository productGroupRepository;

    public ProductGroupService(ProductGroupRepository productGroupRepository) {
        this.productGroupRepository = productGroupRepository;
    }

    public ProductGroupDTO save(ProductGroupDTO productGroup) {
        return productGroupRepository.save(productGroup);
    }

    public ProductGroupDTO get(Long id) {
        return productGroupRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product Group not found with ID : " + id));
    }

    public List<ProductGroupDTO> getActiveProductGroupList() {
        return productGroupRepository.findByIsDeletedFalseAndIsActiveTrue();
    }

    @Transactional
    public void delete(Long id) {

        ProductGroupDTO productGroup = productGroupRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product Group not found with ID : " + id));

        productGroup.setIsDeleted(true);

        productGroupRepository.save(productGroup);
    }

}