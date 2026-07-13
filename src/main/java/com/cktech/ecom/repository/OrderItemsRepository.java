package com.cktech.ecom.repository;

import com.cktech.ecom.model.orderitems.OrderItemsDTO;
import com.cktech.ecom.repository.common.GenericRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderItemsRepository extends GenericRepository<OrderItemsDTO, Long> {

}