package com.cktech.ecom.repository;

import com.cktech.ecom.model.product.CartDTO;
import com.cktech.ecom.repository.common.GenericRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CartRepository extends GenericRepository<CartDTO, Long> {

    @Override
    List<CartDTO> findByIsDeletedFalse();

    @Override
    List<CartDTO> findByIsDeletedFalseAndIsActiveTrue();
}
