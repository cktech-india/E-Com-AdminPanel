package com.cktech.ecom.service;

import com.cktech.ecom.model.faq.FaqDTO;
import com.cktech.ecom.repository.FaqRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FaqService {

    private final FaqRepository faqRepository;

    public FaqService(FaqRepository faqRepository) {
        this.faqRepository = faqRepository;
    }

    public FaqDTO save(FaqDTO faq) {
        return faqRepository.save(faq);
    }

    public FaqDTO get(Long id) {
        return faqRepository.findById(id).orElseThrow();
    }

    public List<FaqDTO> getList() {
        return faqRepository.findByIsDeletedFalse();
    }

    public List<FaqDTO> getActiveFaqList() {
        return faqRepository.findByIsDeletedFalseAndIsActiveTrue();
    }

    @Transactional
    public void delete(Long id) {
        var data = faqRepository.findById(id).orElseThrow();
        data.setIsDeleted(true);
        faqRepository.save(data);
    }
}