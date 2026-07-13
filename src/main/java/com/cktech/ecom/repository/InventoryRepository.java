package com.cktech.ecom.repository;

import com.cktech.ecom.model.inventory.InventoryDTO;
import com.cktech.ecom.repository.common.GenericRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InventoryRepository extends GenericRepository<InventoryDTO, Long> {

}