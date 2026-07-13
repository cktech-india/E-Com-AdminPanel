package com.cktech.ecom.controller;

import com.cktech.ecom.model.orderitems.OrderItemsDTO;
import com.cktech.ecom.service.OrderItemsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/order-items")
public class OrderItemsController {

    private final OrderItemsService orderItemsService;

    public OrderItemsController(OrderItemsService orderItemsService) {
        this.orderItemsService = orderItemsService;
    }

    @PostMapping("")
    public ResponseEntity<OrderItemsDTO> save(@RequestBody OrderItemsDTO orderItem) {
        return ResponseEntity.ok(orderItemsService.save(orderItem));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderItemsDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(orderItemsService.get(id));
    }

    @GetMapping("/list")
    public ResponseEntity<List<OrderItemsDTO>> getList() {
        return ResponseEntity.ok(orderItemsService.getList());
    }

    @GetMapping("/active-list")
    public ResponseEntity<List<OrderItemsDTO>> getActiveList() {
        return ResponseEntity.ok(orderItemsService.getActiveOrderItemsList());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        orderItemsService.delete(id);
        return ResponseEntity.ok("Order Item deleted successfully");
    }
}