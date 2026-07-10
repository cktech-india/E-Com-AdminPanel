package com.cktech.ecom.service;

import com.cktech.ecom.model.company.CompanyDTO;
import com.cktech.ecom.repository.CompanyRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CompanyService {

    private final CompanyRepository companyRepository;

    public CompanyService(CompanyRepository companyRepository) {
        this.companyRepository = companyRepository;
    }

    public CompanyDTO save(CompanyDTO company) {
        return companyRepository.save(company);
    }

    public CompanyDTO get(String companyCode) {
        return companyRepository.findById(companyCode).orElseThrow();
    }

    public List<CompanyDTO> getList() {
        return companyRepository.findByIsDeletedFalse();
    }

    public List<CompanyDTO> getActiveCompanyList() {
        return companyRepository.findByIsDeletedFalseAndIsActiveTrue();
    }

    @Transactional
    public void delete(String companyCode) {
        var data = companyRepository.findById(companyCode).orElseThrow();
        data.setIsDeleted(true);
        companyRepository.save(data);
    }
}