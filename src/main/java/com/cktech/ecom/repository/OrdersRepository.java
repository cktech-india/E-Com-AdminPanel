package com.cktech.ecom.repository;

import com.cktech.ecom.model.orders.OrdersDTO;
import com.cktech.ecom.repository.common.GenericRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrdersRepository extends GenericRepository<OrdersDTO, Long> {

}