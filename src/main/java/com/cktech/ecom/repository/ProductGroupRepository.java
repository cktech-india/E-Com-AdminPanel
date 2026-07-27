package com.cktech.ecom.repository;

import com.cktech.ecom.model.product.ProductGroupDTO;
import com.cktech.ecom.repository.common.GenericRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductGroupRepository extends GenericRepository<ProductGroupDTO, Long> {

    @Override
    List<ProductGroupDTO> findByIsDeletedFalse();

    @Override
    List<ProductGroupDTO> findByIsDeletedFalseAndIsActiveTrue();

    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT pg.groupName FROM ProductGroupDTO pg WHERE pg.isDeleted = false AND pg.isActive = true")
    List<String> findDistinctGroupNames();
}