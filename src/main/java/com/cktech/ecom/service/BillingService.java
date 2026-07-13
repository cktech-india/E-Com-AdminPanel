package com.cktech.ecom.service;

import com.cktech.ecom.model.billing.BillingDTO;
import com.cktech.ecom.repository.BillingRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BillingService {

    private final BillingRepository billingRepository;

    public BillingService(BillingRepository billingRepository) {
        this.billingRepository = billingRepository;
    }

    public BillingDTO save(BillingDTO billing) {
        return billingRepository.save(billing);
    }

    public BillingDTO get(Long id) {
        return billingRepository.findById(id).orElseThrow();
    }

    public List<BillingDTO> getList() {
        return billingRepository.findByIsDeletedFalse();
    }

    public List<BillingDTO> getActiveBillingList() {
        return billingRepository.findByIsDeletedFalseAndIsActiveTrue();
    }

    @Transactional
    public void delete(Long id) {
        var data = billingRepository.findById(id).orElseThrow();
        data.setIsDeleted(true);
        billingRepository.save(data);
    }
}