package com.cktech.ecom.controller;

import com.cktech.ecom.model.inventory.InventoryDTO;
import com.cktech.ecom.service.InventoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @PostMapping("")
    public ResponseEntity<InventoryDTO> save(@RequestBody InventoryDTO inventory) {
        return ResponseEntity.ok(inventoryService.save(inventory));
    }

    @GetMapping("/{id}")
    public ResponseEntity<InventoryDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(inventoryService.get(id));
    }

    @GetMapping("/list")
    public ResponseEntity<List<InventoryDTO>> getList() {
        return ResponseEntity.ok(inventoryService.getList());
    }

    @GetMapping("/active-list")
    public ResponseEntity<List<InventoryDTO>> getActiveList() {
        return ResponseEntity.ok(inventoryService.getActiveInventoryList());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        inventoryService.delete(id);
        return ResponseEntity.ok("Inventory deleted successfully");
    }
}