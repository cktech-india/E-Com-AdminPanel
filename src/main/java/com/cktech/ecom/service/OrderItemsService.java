package com.cktech.ecom.service;

import com.cktech.ecom.model.orderitems.OrderItemsDTO;
import com.cktech.ecom.repository.OrderItemsRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrderItemsService {

    private final OrderItemsRepository orderItemsRepository;

    public OrderItemsService(OrderItemsRepository orderItemsRepository) {
        this.orderItemsRepository = orderItemsRepository;
    }

    public OrderItemsDTO save(OrderItemsDTO orderItem) {
        return orderItemsRepository.save(orderItem);
    }

    public OrderItemsDTO get(Long id) {
        return orderItemsRepository.findById(id).orElseThrow();
    }

    public List<OrderItemsDTO> getList() {
        return orderItemsRepository.findByIsDeletedFalse();
    }

    public List<OrderItemsDTO> getActiveOrderItemsList() {
        return orderItemsRepository.findByIsDeletedFalseAndIsActiveTrue();
    }

    @Transactional
    public void delete(Long id) {
        var data = orderItemsRepository.findById(id).orElseThrow();
        data.setIsDeleted(true);
        orderItemsRepository.save(data);
    }
}