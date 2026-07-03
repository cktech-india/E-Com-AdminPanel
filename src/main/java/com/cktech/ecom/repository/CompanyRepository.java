package com.cktech.ecom.repository;

import com.cktech.ecom.model.company.CompanyDTO;
import com.cktech.ecom.repository.common.GenericRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CompanyRepository extends GenericRepository<CompanyDTO, String> {
}