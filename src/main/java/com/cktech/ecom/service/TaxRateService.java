package com.cktech.ecom.service;

import com.cktech.ecom.model.tax.TaxRateDTO;
import com.cktech.ecom.repository.TaxRateRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaxRateService {
    private final TaxRateRepository taxRateRepository;

    public TaxRateService(TaxRateRepository taxRateRepository) {
        this.taxRateRepository = taxRateRepository;
    }

    public TaxRateDTO save(TaxRateDTO taxRate) {
        return taxRateRepository.save(taxRate);
    }

    public TaxRateDTO get(Long id) {
        return taxRateRepository.findById(id).orElseThrow();
    }

    public List<TaxRateDTO> getList() {
        return taxRateRepository.findByIsDeletedFalse();
    }

    public List<TaxRateDTO> getActiveList() {
        return taxRateRepository.findByIsDeletedFalseAndIsActiveTrue();
    }

    @Transactional
    public void delete(Long id) {
        taxRateRepository.updateIsDeletedFlag(id, true, "id");
    }
}