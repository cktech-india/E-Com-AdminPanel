package com.cktech.ecom.service;

import com.cktech.ecom.model.orders.OrdersDTO;
import com.cktech.ecom.repository.OrdersRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrdersService {

    private final OrdersRepository ordersRepository;

    public OrdersService(OrdersRepository ordersRepository) {
        this.ordersRepository = ordersRepository;
    }

    public OrdersDTO save(OrdersDTO orders) {
        return ordersRepository.save(orders);
    }

    public OrdersDTO get(Long id) {
        return ordersRepository.findById(id).orElseThrow();
    }

    public List<OrdersDTO> getList() {
        return ordersRepository.findByIsDeletedFalse();
    }

    public List<OrdersDTO> getActiveOrdersList() {
        return ordersRepository.findByIsDeletedFalseAndIsActiveTrue();
    }

    @Transactional
    public void delete(Long id) {
        var data = ordersRepository.findById(id).orElseThrow();
        data.setIsDeleted(true);
        ordersRepository.save(data);
    }
}