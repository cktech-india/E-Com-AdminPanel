package com.cktech.ecom.service;

import com.cktech.ecom.model.stocklog.StockLogDTO;
import com.cktech.ecom.repository.StockLogRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StockLogService {

    private final StockLogRepository stockLogRepository;

    public StockLogService(StockLogRepository stockLogRepository) {
        this.stockLogRepository = stockLogRepository;
    }

    public StockLogDTO save(StockLogDTO stockLog) {
        return stockLogRepository.save(stockLog);
    }

    public StockLogDTO get(Integer id) {
        return stockLogRepository.findById(id).orElseThrow();
    }

    public List<StockLogDTO> getList() {
        return stockLogRepository.findByIsDeletedFalse();
    }

    public List<StockLogDTO> getActiveStockLogList() {
        return stockLogRepository.findByIsDeletedFalseAndIsActiveTrue();
    }

    @Transactional
    public void delete(Integer id) {
        var data = stockLogRepository.findById(id).orElseThrow();
        data.setIsDeleted(true);
        stockLogRepository.save(data);
    }
}