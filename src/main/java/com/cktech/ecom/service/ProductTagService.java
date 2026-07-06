package com.cktech.ecom.service;

import com.cktech.ecom.model.product.ProductTagDTO;
import com.cktech.ecom.repository.ProductTagRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductTagService {

    private final ProductTagRepository productTagRepository;

    public ProductTagService(ProductTagRepository productTagRepository) {
        this.productTagRepository = productTagRepository;
    }

    // Save Tag
    public ProductTagDTO save(ProductTagDTO productTag) {
        return productTagRepository.save(productTag);
    }

    // Get Tag by ID
    public ProductTagDTO get(Long id) {
        return productTagRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product Tag not found with ID : " + id));
    }
    

    // Get Active Tags
    public List<ProductTagDTO> getActiveProductTagList() {
        return productTagRepository.findByIsDeletedFalseAndIsActiveTrue();
    }


    // Soft Delete
    @Transactional
    public void delete(Long id) {

        ProductTagDTO productTag = productTagRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product Tag not found with ID : " + id));

        productTag.setIsDeleted(true);

        productTagRepository.save(productTag);
    }
}