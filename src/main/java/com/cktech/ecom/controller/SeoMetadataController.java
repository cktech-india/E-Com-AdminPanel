package com.cktech.ecom.controller;

import com.cktech.ecom.model.seo.SeoMetadataDTO;
import com.cktech.ecom.service.SeoMetadataService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/seo-metadata")
public class SeoMetadataController {

    private final SeoMetadataService seoMetadataService;

    public SeoMetadataController(SeoMetadataService seoMetadataService) {
        this.seoMetadataService = seoMetadataService;
    }

    @PostMapping("")
    public ResponseEntity<SeoMetadataDTO> save(@RequestBody SeoMetadataDTO seo) {
        return ResponseEntity.ok(seoMetadataService.save(seo));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SeoMetadataDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(seoMetadataService.get(id));
    }

    @GetMapping("/list")
    public ResponseEntity<List<SeoMetadataDTO>> getList() {
        return ResponseEntity.ok(seoMetadataService.getList());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        seoMetadataService.delete(id);
        return ResponseEntity.ok("SEO Metadata deleted successfully");
    }
}
