package com.cktech.ecom.service;

import com.cktech.ecom.model.tax.ContactInquiryDTO;
import com.cktech.ecom.repository.ContactInquiryRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ContactInquiryService {
    private final ContactInquiryRepository contactInquiryRepository;

    public ContactInquiryService(ContactInquiryRepository contactInquiryRepository) {
        this.contactInquiryRepository = contactInquiryRepository;
    }

    public ContactInquiryDTO save(ContactInquiryDTO contactInquiry) {
        return contactInquiryRepository.save(contactInquiry);
    }

    public ContactInquiryDTO get(Long id) {
        return contactInquiryRepository.findById(id).orElseThrow();
    }

    public List<ContactInquiryDTO> getList() {
        return contactInquiryRepository.findByIsDeletedFalse();
    }

    public List<ContactInquiryDTO> getActiveList() {
        return contactInquiryRepository.findByIsDeletedFalseAndIsActiveTrue();
    }

    @Transactional
    public void delete(Long id) {
        var data = contactInquiryRepository.findById(id).orElseThrow();
        data.setIsDeleted(true);
        contactInquiryRepository.save(data);
    }
}