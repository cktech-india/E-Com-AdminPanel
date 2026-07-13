package com.cktech.ecom.service;

import com.cktech.ecom.model.inventory.InventoryDTO;
import com.cktech.ecom.repository.InventoryRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InventoryService {

    private final InventoryRepository inventoryRepository;

    public InventoryService(InventoryRepository inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }

    public InventoryDTO save(InventoryDTO inventory) {
        return inventoryRepository.save(inventory);
    }

    public InventoryDTO get(Long id) {
        return inventoryRepository.findById(id).orElseThrow();
    }

    public List<InventoryDTO> getList() {
        return inventoryRepository.findByIsDeletedFalse();
    }

    public List<InventoryDTO> getActiveInventoryList() {
        return inventoryRepository.findByIsDeletedFalseAndIsActiveTrue();
    }

    @Transactional
    public void delete(Long id) {
        var data = inventoryRepository.findById(id).orElseThrow();
        data.setIsDeleted(true);
        inventoryRepository.save(data);
    }
}