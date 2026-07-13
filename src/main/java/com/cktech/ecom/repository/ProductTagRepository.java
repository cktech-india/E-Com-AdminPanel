package com.cktech.ecom.repository;

import com.cktech.ecom.model.product.ProductTagDTO;
import com.cktech.ecom.repository.common.GenericRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductTagRepository extends GenericRepository<ProductTagDTO, Long> {

    @Override
    List<ProductTagDTO> findByIsDeletedFalse();

    @Override
    List<ProductTagDTO> findByIsDeletedFalseAndIsActiveTrue();

}