package com.cktech.ecom.repository;

import com.cktech.ecom.model.product.ProductDTO;
import com.cktech.ecom.repository.common.GenericRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends GenericRepository<ProductDTO, Long> {

    @Override
    List<ProductDTO> findByIsDeletedFalse();

    @Override
    List<ProductDTO> findByIsDeletedFalseAndIsActiveTrue();
}