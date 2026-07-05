package com.cktech.ecom.controller;

import com.cktech.ecom.model.tax.GstHsnCodeDTO;
import com.cktech.ecom.service.GstHsnCodeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/gst-hsn-codes")
public class GstHsnCodeController {
    private final GstHsnCodeService gstHsnCodeService;

    public GstHsnCodeController(GstHsnCodeService gstHsnCodeService) {
        this.gstHsnCodeService = gstHsnCodeService;
    }

    @PostMapping("")
    public ResponseEntity<GstHsnCodeDTO> save(@RequestBody GstHsnCodeDTO gstHsnCode) {
        return ResponseEntity.ok(gstHsnCodeService.save(gstHsnCode));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GstHsnCodeDTO> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(gstHsnCodeService.get(id));
    }

    @GetMapping("/list")
    public ResponseEntity<List<GstHsnCodeDTO>> getList() {
        return ResponseEntity.ok(gstHsnCodeService.getList());
    }

    @GetMapping("/active-list")
    public ResponseEntity<List<GstHsnCodeDTO>> getActiveList() {
        return ResponseEntity.ok(gstHsnCodeService.getActiveList());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Integer id) {
        gstHsnCodeService.delete(id);
        return ResponseEntity.ok("GST HSN code deleted successfully");
    }
}