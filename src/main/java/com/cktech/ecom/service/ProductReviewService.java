package com.cktech.ecom.service;

import com.cktech.ecom.model.product.ProductReviewDTO;
import com.cktech.ecom.repository.ProductReviewRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductReviewService {

    private final ProductReviewRepository productReviewRepository;

    public ProductReviewService(ProductReviewRepository productReviewRepository) {
        this.productReviewRepository = productReviewRepository;
    }

    public ProductReviewDTO save(ProductReviewDTO productReview) {
        return productReviewRepository.save(productReview);
    }

    public ProductReviewDTO get(Long id) {
        return productReviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product Review not found with ID : " + id));
    }

    public List<ProductReviewDTO> getActiveProductReviewList() {
        return productReviewRepository.findByIsDeletedFalseAndIsActiveTrue();
    }

    @Transactional
    public void delete(Long id) {

        ProductReviewDTO productReview = productReviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product Review not found with ID : " + id));

        productReview.setIsDeleted(true);

        productReviewRepository.save(productReview);
    }
}