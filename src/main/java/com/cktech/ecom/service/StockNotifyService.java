package com.cktech.ecom.service;

import com.cktech.ecom.model.product.StockNotifyDTO;
import com.cktech.ecom.repository.StockNotifyRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StockNotifyService {

    private final StockNotifyRepository stockNotifyRepository;

    public StockNotifyService(StockNotifyRepository stockNotifyRepository) {
        this.stockNotifyRepository = stockNotifyRepository;
    }

    public StockNotifyDTO save(StockNotifyDTO dto) {
        return stockNotifyRepository.save(dto);
    }

    public StockNotifyDTO get(Long id) {
        return stockNotifyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Stock notification request not found with ID : " + id));
    }

    public List<StockNotifyDTO> getList() {
        return stockNotifyRepository.findByIsDeletedFalse();
    }

    public List<StockNotifyDTO> getActiveList() {
        return stockNotifyRepository.findByIsDeletedFalseAndIsActiveTrue();
    }

    @Transactional
    public StockNotifyDTO delete(Long id) {
        StockNotifyDTO dto = stockNotifyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Stock notification request not found with ID : " + id));
        dto.setIsDeleted(true);
        return stockNotifyRepository.save(dto);
    }
}
