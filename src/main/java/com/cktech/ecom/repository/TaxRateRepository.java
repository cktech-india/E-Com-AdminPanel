package com.cktech.ecom.repository;

import com.cktech.ecom.model.tax.TaxRateDTO;
import com.cktech.ecom.repository.common.GenericRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface TaxRateRepository extends GenericRepository<TaxRateDTO, Long> {

}