package com.cktech.ecom.service;

import com.cktech.ecom.model.billingdetails.BillingDetailsDTO;
import com.cktech.ecom.repository.BillingDetailsRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BillingDetailsService {

    private final BillingDetailsRepository billingDetailsRepository;

    public BillingDetailsService(BillingDetailsRepository billingDetailsRepository) {
        this.billingDetailsRepository = billingDetailsRepository;
    }

    public BillingDetailsDTO save(BillingDetailsDTO billingDetails) {
        return billingDetailsRepository.save(billingDetails);
    }

    public BillingDetailsDTO get(Long id) {
        return billingDetailsRepository.findById(id).orElseThrow();
    }

    public List<BillingDetailsDTO> getList() {
        return billingDetailsRepository.findByIsDeletedFalse();
    }

    public List<BillingDetailsDTO> getActiveBillingDetailsList() {
        return billingDetailsRepository.findByIsDeletedFalseAndIsActiveTrue();
    }

    @Transactional
    public void delete(Long id) {
        var data = billingDetailsRepository.findById(id).orElseThrow();
        data.setIsDeleted(true);
        billingDetailsRepository.save(data);
    }
}