package com.cktech.ecom.repository;

import com.cktech.ecom.model.product.ProductReviewDTO;
import com.cktech.ecom.repository.common.GenericRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductReviewRepository extends GenericRepository<ProductReviewDTO, Long> {

    @Override
    List<ProductReviewDTO> findByIsDeletedFalse();

    @Override
    List<ProductReviewDTO> findByIsDeletedFalseAndIsActiveTrue();

}