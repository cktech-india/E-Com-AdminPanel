package com.cktech.ecom.repository;

import com.cktech.ecom.model.tax.TaxCategoryDTO;
import com.cktech.ecom.repository.common.GenericRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TaxCategoryRepository extends GenericRepository<TaxCategoryDTO, Long> {
}