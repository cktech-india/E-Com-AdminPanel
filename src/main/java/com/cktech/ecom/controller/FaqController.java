package com.cktech.ecom.controller;

import com.cktech.ecom.model.faq.FaqDTO;
import com.cktech.ecom.service.FaqService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/faqs")
public class FaqController {

    private final FaqService faqService;

    public FaqController(FaqService faqService) {
        this.faqService = faqService;
    }

    @PostMapping("")
    public ResponseEntity<FaqDTO> save(@RequestBody FaqDTO faq) {
        return ResponseEntity.ok(faqService.save(faq));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FaqDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(faqService.get(id));
    }

    @GetMapping("/list")
    public ResponseEntity<List<FaqDTO>> getList() {
        return ResponseEntity.ok(faqService.getList());
    }

    @GetMapping("/active-list")
    public ResponseEntity<List<FaqDTO>> getActiveList() {
        return ResponseEntity.ok(faqService.getActiveFaqList());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        faqService.delete(id);
        return ResponseEntity.ok("FAQ deleted successfully");
    }
}
