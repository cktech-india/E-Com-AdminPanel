package com.cktech.ecom.repository;

import com.cktech.ecom.model.product.ProductMediaDTO;
import com.cktech.ecom.repository.common.GenericRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductMediaRepository extends GenericRepository<ProductMediaDTO, Long> {

    @Override
    List<ProductMediaDTO> findByIsDeletedFalse();

    @Override
    List<ProductMediaDTO> findByIsDeletedFalseAndIsActiveTrue();
}