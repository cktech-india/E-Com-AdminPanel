package com.cktech.ecom.controller;

import com.cktech.ecom.model.orders.OrdersDTO;
import com.cktech.ecom.service.OrdersService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin("*")
public class OrdersController {

    private final OrdersService ordersService;

    public OrdersController(OrdersService ordersService) {
        this.ordersService = ordersService;
    }

    @PostMapping
    public OrdersDTO save(@RequestBody OrdersDTO orders) {
        return ordersService.save(orders);
    }

    @GetMapping("/{id}")
    public OrdersDTO get(@PathVariable Long id) {
        return ordersService.get(id);
    }

    @GetMapping("/list")
    public List<OrdersDTO> getList() {
        return ordersService.getList();
    }

    @GetMapping("/active-list")
    public List<OrdersDTO> getActiveList() {
        return ordersService.getActiveOrdersList();
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        ordersService.delete(id);
    }
}