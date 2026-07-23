package com.cktech.ecom.repository;

import com.cktech.ecom.model.product.StockNotifyDTO;
import com.cktech.ecom.repository.common.GenericRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockNotifyRepository extends GenericRepository<StockNotifyDTO, Long> {

    @Override
    List<StockNotifyDTO> findByIsDeletedFalse();

    @Override
    List<StockNotifyDTO> findByIsDeletedFalseAndIsActiveTrue();
}
