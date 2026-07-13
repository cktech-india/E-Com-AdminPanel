package com.cktech.ecom.repository;

import com.cktech.ecom.model.stocklog.StockLogDTO;
import com.cktech.ecom.repository.common.GenericRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StockLogRepository extends GenericRepository<StockLogDTO, Integer> {

}