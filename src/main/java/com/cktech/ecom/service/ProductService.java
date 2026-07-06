package com.cktech.ecom.service;

import com.cktech.ecom.model.product.ProductDTO;
import com.cktech.ecom.repository.ProductRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public ProductDTO save(ProductDTO product) {
        return productRepository.save(product);
    }

    public ProductDTO get(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with ID : " + id));
    }



    public List<ProductDTO> getActiveProductList() {
        return productRepository.findByIsDeletedFalseAndIsActiveTrue();
    }



    @Transactional
    public void delete(Long id) {
        ProductDTO product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with ID : " + id));

        product.setIsDeleted(true);
        productRepository.save(product);
    }
}