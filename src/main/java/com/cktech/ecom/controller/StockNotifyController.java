package com.cktech.ecom.controller;

import com.cktech.ecom.model.product.StockNotifyDTO;
import com.cktech.ecom.service.StockNotifyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stock-notify")
public class StockNotifyController {

    private final StockNotifyService stockNotifyService;

    public StockNotifyController(StockNotifyService stockNotifyService) {
        this.stockNotifyService = stockNotifyService;
    }

    @PostMapping
    public ResponseEntity<StockNotifyDTO> save(@RequestBody StockNotifyDTO dto) {
        return ResponseEntity.ok(stockNotifyService.save(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<StockNotifyDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(stockNotifyService.get(id));
    }

    @GetMapping("/list")
    public ResponseEntity<List<StockNotifyDTO>> getList() {
        return ResponseEntity.ok(stockNotifyService.getList());
    }

    @GetMapping("/active-list")
    public ResponseEntity<List<StockNotifyDTO>> getActiveList() {
        return ResponseEntity.ok(stockNotifyService.getActiveList());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        stockNotifyService.delete(id);
        return ResponseEntity.ok().build();
    }
}
