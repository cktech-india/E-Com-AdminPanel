package com.cktech.ecom.controller;

import com.cktech.ecom.model.tax.ContactInquiryDTO;
import com.cktech.ecom.service.ContactInquiryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contact-inquiries")
public class ContactInquiryController {
    private final ContactInquiryService contactInquiryService;

    public ContactInquiryController(ContactInquiryService contactInquiryService) {
        this.contactInquiryService = contactInquiryService;
    }

    @PostMapping("")
    public ResponseEntity<ContactInquiryDTO> save(@RequestBody ContactInquiryDTO contactInquiry) {
        return ResponseEntity.ok(contactInquiryService.save(contactInquiry));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContactInquiryDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(contactInquiryService.get(id));
    }

    @GetMapping("/list")
    public ResponseEntity<List<ContactInquiryDTO>> getList() {
        return ResponseEntity.ok(contactInquiryService.getList());
    }

    @GetMapping("/active-list")
    public ResponseEntity<List<ContactInquiryDTO>> getActiveList() {
        return ResponseEntity.ok(contactInquiryService.getActiveList());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        contactInquiryService.delete(id);
        return ResponseEntity.ok("Contact inquiry deleted successfully");
    }
}