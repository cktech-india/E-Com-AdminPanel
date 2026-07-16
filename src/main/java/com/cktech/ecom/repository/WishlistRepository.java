package com.cktech.ecom.repository;

import com.cktech.ecom.model.product.WishlistDTO;
import com.cktech.ecom.repository.common.GenericRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WishlistRepository extends GenericRepository<WishlistDTO, Long> {

    @Override
    List<WishlistDTO> findByIsDeletedFalse();

    @Override
    List<WishlistDTO> findByIsDeletedFalseAndIsActiveTrue();
}
