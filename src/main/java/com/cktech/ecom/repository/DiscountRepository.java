package com.cktech.ecom.repository;

import com.cktech.ecom.model.product.DiscountDTO;
import com.cktech.ecom.repository.common.GenericRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DiscountRepository extends GenericRepository<DiscountDTO, Long> {

    @Override
    List<DiscountDTO> findByIsDeletedFalse();

    @Override
    List<DiscountDTO> findByIsDeletedFalseAndIsActiveTrue();

}