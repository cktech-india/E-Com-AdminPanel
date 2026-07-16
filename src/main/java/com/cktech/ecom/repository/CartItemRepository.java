package com.cktech.ecom.repository;

import com.cktech.ecom.model.product.CartItemDTO;
import com.cktech.ecom.repository.common.GenericRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CartItemRepository extends GenericRepository<CartItemDTO, Long> {

    @Override
    List<CartItemDTO> findByIsDeletedFalse();

    @Override
    List<CartItemDTO> findByIsDeletedFalseAndIsActiveTrue();

    List<CartItemDTO> findByCartId(Long cartId);
}
