package com.cktech.ecom.controller;

import com.cktech.ecom.model.stocklog.StockLogDTO;
import com.cktech.ecom.service.StockLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stock-log")
public class StockLogController {

    private final StockLogService stockLogService;

    public StockLogController(StockLogService stockLogService) {
        this.stockLogService = stockLogService;
    }

    @PostMapping("")
    public ResponseEntity<StockLogDTO> save(@RequestBody StockLogDTO stockLog) {
        return ResponseEntity.ok(stockLogService.save(stockLog));
    }

    @GetMapping("/{id}")
    public ResponseEntity<StockLogDTO> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(stockLogService.get(id));
    }

    @GetMapping("/list")
    public ResponseEntity<List<StockLogDTO>> getList() {
        return ResponseEntity.ok(stockLogService.getList());
    }

    @GetMapping("/active-list")
    public ResponseEntity<List<StockLogDTO>> getActiveList() {
        return ResponseEntity.ok(stockLogService.getActiveStockLogList());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Integer id) {
        stockLogService.delete(id);
        return ResponseEntity.ok("Stock Log deleted successfully");
    }
}